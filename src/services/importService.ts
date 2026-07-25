import * as XLSX from 'xlsx';
import { Cheque } from '../types';
import { storageService, computeChequeStatus } from './storageService';

export interface ColumnMapping {
  receiveDate: string;
  receiveFrom: string;
  city: string;
  bank: string;
  chequeNumber: string;
  chequeDate: string;
  amount: string;
  receivedBy: string;
  voucherNumber: string;
  paidDate: string;
  paidTo: string;
  remarks: string;
}

export interface ParsedRow {
  rowNumber: number;
  data: Record<string, any>;
  mappedCheque?: Omit<Cheque, 'id' | 'createdAt' | 'updatedAt'>;
  isValid: boolean;
  isDuplicate: boolean;
  errors: string[];
}

export interface ImportResult {
  inserted: number;
  skipped: number;
  errors: number;
  duplicateChequeNumbers: string[];
}

export function parseImportFile(file: File): Promise<{ headers: string[]; rawRows: Record<string, any>[] }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array', cellDates: true });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];

        const jsonData: any[][] = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: '' });

        if (jsonData.length < 1) {
          reject(new Error('The uploaded file is empty.'));
          return;
        }

        // Find header row (first non-empty row)
        let headerRowIndex = 0;
        for (let i = 0; i < jsonData.length; i++) {
          if (jsonData[i].some((cell) => cell && String(cell).trim() !== '')) {
            headerRowIndex = i;
            break;
          }
        }

        const rawHeaders = jsonData[headerRowIndex].map((h) => String(h).trim());
        const headers = rawHeaders.filter((h) => h.length > 0);

        const rawRows: Record<string, any>[] = [];

        for (let i = headerRowIndex + 1; i < jsonData.length; i++) {
          const rowArray = jsonData[i];
          if (!rowArray || rowArray.every((cell) => !cell || String(cell).trim() === '')) {
            continue; // Skip empty rows
          }

          const rowObj: Record<string, any> = {};
          rawHeaders.forEach((header, colIndex) => {
            if (header) {
              rowObj[header] = rowArray[colIndex] !== undefined ? rowArray[colIndex] : '';
            }
          });
          rawRows.push(rowObj);
        }

        resolve({ headers, rawRows });
      } catch (err: any) {
        reject(new Error('Failed to read Excel/CSV file: ' + err.message));
      }
    };

    reader.onerror = () => reject(new Error('File reading error'));
    reader.readAsArrayBuffer(file);
  });
}

export function guessColumnMapping(headers: string[]): ColumnMapping {
  const mapping: ColumnMapping = {
    receiveDate: '',
    receiveFrom: '',
    city: '',
    bank: '',
    chequeNumber: '',
    chequeDate: '',
    amount: '',
    receivedBy: '',
    voucherNumber: '',
    paidDate: '',
    paidTo: '',
    remarks: '',
  };

  headers.forEach((h) => {
    const lower = h.toLowerCase().replace(/[^a-z0-9]/g, '');

    if (lower.includes('recdate') || lower.includes('receivedate') || lower === 'date') {
      mapping.receiveDate = h;
    } else if (lower.includes('party') || lower.includes('receivefrom') || lower.includes('client') || lower.includes('customer')) {
      mapping.receiveFrom = h;
    } else if (lower.includes('city') || lower.includes('location')) {
      mapping.city = h;
    } else if (lower.includes('bank') || lower.includes('drawee')) {
      mapping.bank = h;
    } else if (lower.includes('cheque') || lower.includes('chq') || lower.includes('check') || lower.includes('number')) {
      if (lower.includes('date')) {
        mapping.chequeDate = h;
      } else {
        mapping.chequeNumber = h;
      }
    } else if (lower.includes('amount') || lower.includes('pkr') || lower.includes('rs') || lower.includes('value')) {
      mapping.amount = h;
    } else if (lower.includes('recby') || lower.includes('receivedby') || lower.includes('collector') || lower.includes('employee')) {
      mapping.receivedBy = h;
    } else if (lower.includes('voucher') || lower.includes('vno') || lower.includes('voucherno')) {
      mapping.voucherNumber = h;
    } else if (lower.includes('paiddate') || lower.includes('cleareddate')) {
      mapping.paidDate = h;
    } else if (lower.includes('paidto') || lower.includes('account')) {
      mapping.paidTo = h;
    } else if (lower.includes('remark') || lower.includes('note') || lower.includes('comment')) {
      mapping.remarks = h;
    }
  });

  return mapping;
}

export function validateAndMapRows(rawRows: Record<string, any>[], mapping: ColumnMapping): ParsedRow[] {
  const existingCheques = storageService.getCheques();
  const existingNumbers = new Set(existingCheques.map((c) => c.chequeNumber.toLowerCase().trim()));

  return rawRows.map((row, idx) => {
    const errors: string[] = [];

    const rawRecDate = row[mapping.receiveDate];
    const rawParty = row[mapping.receiveFrom];
    const rawCity = row[mapping.city];
    const rawBank = row[mapping.bank];
    const rawChqNum = String(row[mapping.chequeNumber] || '').trim();
    const rawChqDate = row[mapping.chequeDate];
    const rawAmount = row[mapping.amount];
    const rawRecBy = row[mapping.receivedBy];
    const rawVoucher = String(row[mapping.voucherNumber] || '').trim();
    const rawPaidDate = row[mapping.paidDate];
    const rawPaidTo = row[mapping.paidTo];
    const rawRemarks = row[mapping.remarks];

    if (!rawParty) errors.push('Party Name (Receive From) is required.');
    if (!rawBank) errors.push('Bank Name is required.');
    if (!rawChqNum) errors.push('Cheque Number is required.');

    // Parse Amount
    let numAmount = 0;
    if (typeof rawAmount === 'number') {
      numAmount = rawAmount;
    } else if (typeof rawAmount === 'string') {
      numAmount = parseFloat(rawAmount.replace(/[^0-9.]/g, ''));
    }
    if (isNaN(numAmount) || numAmount <= 0) {
      errors.push('Amount must be a positive number.');
    }

    // Format dates cleanly
    const parseDateStr = (val: any): string => {
      if (!val) return new Date().toISOString().split('T')[0];
      if (val instanceof Date) {
        return val.toISOString().split('T')[0];
      }
      const str = String(val).trim();
      if (/^\d{4}-\d{2}-\d{2}$/.test(str)) return str;
      const d = new Date(str);
      if (!isNaN(d.getTime())) return d.toISOString().split('T')[0];
      return new Date().toISOString().split('T')[0];
    };

    const receiveDate = parseDateStr(rawRecDate);
    const chequeDate = parseDateStr(rawChqDate);
    const paidDate = rawPaidDate ? parseDateStr(rawPaidDate) : '';

    const isDuplicate = rawChqNum ? existingNumbers.has(rawChqNum.toLowerCase()) : false;
    if (isDuplicate) {
      errors.push(`Duplicate Cheque #${rawChqNum} already exists in database.`);
    }

    const computedStatus = computeChequeStatus(rawVoucher);

    const isValid = errors.length === 0;

    return {
      rowNumber: idx + 1,
      data: row,
      isValid,
      isDuplicate,
      errors,
      mappedCheque: {
        receiveDate,
        receiveFrom: String(rawParty || 'Unknown Party').trim(),
        city: String(rawCity || 'Faisalabad').trim(),
        bank: String(rawBank || 'General Bank').trim(),
        chequeNumber: rawChqNum,
        chequeDate,
        amount: numAmount,
        receivedBy: String(rawRecBy || 'Office Staff').trim(),
        voucherNumber: rawVoucher,
        paidDate,
        paidTo: String(rawPaidTo || '').trim(),
        status: computedStatus,
        remarks: String(rawRemarks || '').trim(),
      },
    };
  });
}

export function generateSampleTemplate() {
  const sampleData = [
    [
      'Receive Date',
      'Receive From',
      'City',
      'Bank',
      'Cheque Number',
      'Cheque Date',
      'Amount',
      'Received By',
      'Voucher Number',
      'Paid Date',
      'Paid To',
      'Remarks',
    ],
    [
      '2026-07-24',
      'Madina Pulse Wholesalers',
      'Lahore',
      'Meezan Bank',
      'MZB-998811',
      '2026-08-01',
      1250000,
      'Zubair Ahmad',
      '',
      '',
      '',
      'Sample Outstanding Cheque for Pulse Dispatch',
    ],
    [
      '2026-07-20',
      'Al-Rehman Grain Merchants',
      'Faisalabad',
      'Habib Bank Limited (HBL)',
      'HBL-445522',
      '2026-07-22',
      890000,
      'Usman Ghani',
      'V-2026-0788',
      '2026-07-23',
      'Saleem Daal Main A/C',
      'Sample Cleared Cheque',
    ],
  ];

  const worksheet = XLSX.utils.aoa_to_sheet(sampleData);
  worksheet['!cols'] = [
    { wch: 14 },
    { wch: 28 },
    { wch: 16 },
    { wch: 24 },
    { wch: 18 },
    { wch: 14 },
    { wch: 16 },
    { wch: 18 },
    { wch: 16 },
    { wch: 14 },
    { wch: 22 },
    { wch: 30 },
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Cheque_Import_Template');
  XLSX.writeFile(workbook, 'SaleemDaal_Cheque_Import_Template.xlsx');
}

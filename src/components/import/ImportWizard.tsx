import React, { useState } from 'react';
import {
  FileUp,
  FileSpreadsheet,
  Download,
  AlertTriangle,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  X,
  Sparkles,
} from 'lucide-react';
import {
  parseImportFile,
  guessColumnMapping,
  validateAndMapRows,
  generateSampleTemplate,
  ColumnMapping,
  ParsedRow,
} from '../../services/importService';
import { storageService } from '../../services/storageService';

export const ImportWizard: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);

  const [file, setFile] = useState<File | null>(null);
  const [headers, setHeaders] = useState<string[]>([]);
  const [rawRows, setRawRows] = useState<Record<string, any>[]>([]);
  const [mapping, setMapping] = useState<ColumnMapping>({
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
  });

  const [parsedRows, setParsedRows] = useState<ParsedRow[]>([]);
  const [importSummary, setImportSummary] = useState({ inserted: 0, skipped: 0 });
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Step 1: Handle File Selection
  const handleFileChange = async (selectedFile: File) => {
    setFile(selectedFile);
    setErrorMsg('');
    setLoading(true);

    try {
      const { headers: parsedHeaders, rawRows: rows } = await parseImportFile(selectedFile);
      setHeaders(parsedHeaders);
      setRawRows(rows);

      const guessed = guessColumnMapping(parsedHeaders);
      setMapping(guessed);

      setStep(2);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to read Excel or CSV file.');
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Validate Mapping & Move to Preview
  const handleProceedToPreview = () => {
    const validated = validateAndMapRows(rawRows, mapping);
    setParsedRows(validated);
    setStep(3);
  };

  // Step 3: Perform Final Import
  const handleExecuteImport = () => {
    const validRows = parsedRows.filter((r) => r.isValid && r.mappedCheque);

    let inserted = 0;
    validRows.forEach((r) => {
      if (r.mappedCheque) {
        storageService.addCheque(r.mappedCheque);
        inserted++;
      }
    });

    const skipped = parsedRows.length - inserted;
    setImportSummary({ inserted, skipped });
    setStep(4);
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      {/* Wizard Header Progress */}
      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600 font-bold text-white">
              <FileUp className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">Excel / CSV Import Engine</h2>
              <p className="text-xs text-slate-500">Migrate existing Excel workbook data seamlessly into system</p>
            </div>
          </div>

          <button
            onClick={generateSampleTemplate}
            className="flex items-center gap-1.5 rounded-lg border border-slate-300 bg-slate-50 px-3 py-1.5 text-xs font-bold text-slate-700 shadow-sm transition hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
          >
            <Download className="h-4 w-4 text-blue-600" />
            <span>Download Sample Excel</span>
          </button>
        </div>

        {/* Step Indicator */}
        <div className="mt-6 flex items-center justify-between border-t border-slate-100 pt-4 text-xs font-bold dark:border-slate-800">
          <div className={`flex items-center gap-2 ${step >= 1 ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400'}`}>
            <span className="flex h-6 w-6 items-center justify-center rounded-full border border-current text-xs">1</span>
            <span>Upload File</span>
          </div>

          <div className={`flex items-center gap-2 ${step >= 2 ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400'}`}>
            <span className="flex h-6 w-6 items-center justify-center rounded-full border border-current text-xs">2</span>
            <span>Map Columns</span>
          </div>

          <div className={`flex items-center gap-2 ${step >= 3 ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400'}`}>
            <span className="flex h-6 w-6 items-center justify-center rounded-full border border-current text-xs">3</span>
            <span>Preview & Validate</span>
          </div>

          <div className={`flex items-center gap-2 ${step >= 4 ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400'}`}>
            <span className="flex h-6 w-6 items-center justify-center rounded-full border border-current text-xs">4</span>
            <span>Import Summary</span>
          </div>
        </div>
      </div>

      {/* STEP 1: FILE DROPZONE */}
      {step === 1 && (
        <div className="rounded-xl border border-dashed border-slate-300 bg-white p-10 text-center shadow-sm dark:border-slate-700 dark:bg-slate-900">
          <FileSpreadsheet className="mx-auto h-12 w-12 text-blue-500" />
          <h3 className="mt-3 text-sm font-bold text-slate-900 dark:text-white">
            Select or Drag Excel Workbook (.xlsx, .xls, .csv)
          </h3>
          <p className="mt-1 text-xs text-slate-500">
            Upload your existing cheque tracking spreadsheet to bulk import records.
          </p>

          <input
            type="file"
            accept=".xlsx, .xls, .csv"
            id="file-upload"
            className="hidden"
            onChange={(e) => {
              if (e.target.files && e.target.files[0]) {
                handleFileChange(e.target.files[0]);
              }
            }}
          />

          <label
            htmlFor="file-upload"
            className="mt-6 inline-flex cursor-pointer items-center gap-2 rounded-xl bg-blue-600 px-6 py-2.5 text-xs font-bold text-white shadow-md transition hover:bg-blue-700"
          >
            <FileUp className="h-4 w-4" />
            <span>Browse Excel File</span>
          </label>

          {loading && (
            <p className="mt-4 text-xs font-semibold text-blue-600 animate-pulse">Reading file content...</p>
          )}

          {errorMsg && <p className="mt-4 text-xs font-semibold text-rose-500">{errorMsg}</p>}
        </div>
      )}

      {/* STEP 2: COLUMN MAPPING */}
      {step === 2 && (
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">Map Excel Columns to Database Fields</h3>
          <p className="text-xs text-slate-500">Match headers from <strong>{file?.name}</strong> to internal fields:</p>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 text-xs">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Receive Date <span className="text-rose-500">*</span>
              </label>
              <select
                value={mapping.receiveDate}
                onChange={(e) => setMapping({ ...mapping, receiveDate: e.target.value })}
                className="w-full rounded-lg border border-slate-300 p-2 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              >
                <option value="">-- Select Excel Header --</option>
                {headers.map((h) => (
                  <option key={h} value={h}>
                    {h}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Party Name (Receive From) <span className="text-rose-500">*</span>
              </label>
              <select
                value={mapping.receiveFrom}
                onChange={(e) => setMapping({ ...mapping, receiveFrom: e.target.value })}
                className="w-full rounded-lg border border-slate-300 p-2 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              >
                <option value="">-- Select Excel Header --</option>
                {headers.map((h) => (
                  <option key={h} value={h}>
                    {h}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                City <span className="text-rose-500">*</span>
              </label>
              <select
                value={mapping.city}
                onChange={(e) => setMapping({ ...mapping, city: e.target.value })}
                className="w-full rounded-lg border border-slate-300 p-2 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              >
                <option value="">-- Select Excel Header --</option>
                {headers.map((h) => (
                  <option key={h} value={h}>
                    {h}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Bank Name <span className="text-rose-500">*</span>
              </label>
              <select
                value={mapping.bank}
                onChange={(e) => setMapping({ ...mapping, bank: e.target.value })}
                className="w-full rounded-lg border border-slate-300 p-2 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              >
                <option value="">-- Select Excel Header --</option>
                {headers.map((h) => (
                  <option key={h} value={h}>
                    {h}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Cheque Number <span className="text-rose-500">*</span>
              </label>
              <select
                value={mapping.chequeNumber}
                onChange={(e) => setMapping({ ...mapping, chequeNumber: e.target.value })}
                className="w-full rounded-lg border border-slate-300 p-2 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              >
                <option value="">-- Select Excel Header --</option>
                {headers.map((h) => (
                  <option key={h} value={h}>
                    {h}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Cheque Date <span className="text-rose-500">*</span>
              </label>
              <select
                value={mapping.chequeDate}
                onChange={(e) => setMapping({ ...mapping, chequeDate: e.target.value })}
                className="w-full rounded-lg border border-slate-300 p-2 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              >
                <option value="">-- Select Excel Header --</option>
                {headers.map((h) => (
                  <option key={h} value={h}>
                    {h}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Amount (PKR) <span className="text-rose-500">*</span>
              </label>
              <select
                value={mapping.amount}
                onChange={(e) => setMapping({ ...mapping, amount: e.target.value })}
                className="w-full rounded-lg border border-slate-300 p-2 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              >
                <option value="">-- Select Excel Header --</option>
                {headers.map((h) => (
                  <option key={h} value={h}>
                    {h}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Voucher Number
              </label>
              <select
                value={mapping.voucherNumber}
                onChange={(e) => setMapping({ ...mapping, voucherNumber: e.target.value })}
                className="w-full rounded-lg border border-slate-300 p-2 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              >
                <option value="">-- Select Excel Header (Optional) --</option>
                {headers.map((h) => (
                  <option key={h} value={h}>
                    {h}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
            <button
              onClick={() => setStep(1)}
              className="flex items-center gap-1 text-xs font-semibold text-slate-600 hover:text-slate-900"
            >
              <ArrowLeft className="h-4 w-4" /> Back to Upload
            </button>

            <button
              onClick={handleProceedToPreview}
              className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-5 py-2 text-xs font-bold text-white shadow hover:bg-blue-700"
            >
              <span>Validate & Preview ({rawRows.length} rows)</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: PREVIEW & VALIDATE */}
      {step === 3 && (
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Import Preview & Validation</h3>
              <p className="text-xs text-slate-500">
                {parsedRows.filter((r) => r.isValid).length} valid rows ready to insert.{' '}
                {parsedRows.filter((r) => !r.isValid).length} invalid/duplicate rows will be skipped.
              </p>
            </div>

            <button
              onClick={handleExecuteImport}
              className="flex items-center gap-1.5 rounded-lg bg-emerald-600 px-5 py-2 text-xs font-bold text-white shadow hover:bg-emerald-700"
            >
              <Sparkles className="h-4 w-4" />
              <span>Confirm & Import Valid Records</span>
            </button>
          </div>

          <div className="overflow-x-auto max-h-[400px] border border-slate-200 rounded-lg dark:border-slate-800">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-100 dark:bg-slate-800 font-bold border-b border-slate-200 dark:border-slate-700">
                <tr>
                  <th className="p-2.5">Row</th>
                  <th className="p-2.5">Status</th>
                  <th className="p-2.5">Party Name</th>
                  <th className="p-2.5">Bank</th>
                  <th className="p-2.5">Cheque #</th>
                  <th className="p-2.5">Amount</th>
                  <th className="p-2.5">Validation Errors</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                {parsedRows.map((r) => (
                  <tr
                    key={r.rowNumber}
                    className={
                      r.isValid
                        ? 'bg-emerald-50/30 dark:bg-emerald-950/20'
                        : 'bg-rose-50/50 dark:bg-rose-950/30'
                    }
                  >
                    <td className="p-2.5 font-bold">{r.rowNumber}</td>
                    <td className="p-2.5">
                      {r.isValid ? (
                        <span className="inline-flex items-center gap-1 text-emerald-600 font-bold">
                          <CheckCircle2 className="h-3.5 w-3.5" /> Valid
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-rose-600 font-bold">
                          <AlertTriangle className="h-3.5 w-3.5" /> Error
                        </span>
                      )}
                    </td>
                    <td className="p-2.5 font-bold">{r.mappedCheque?.receiveFrom || '-'}</td>
                    <td className="p-2.5">{r.mappedCheque?.bank || '-'}</td>
                    <td className="p-2.5 font-mono">{r.mappedCheque?.chequeNumber || '-'}</td>
                    <td className="p-2.5 font-bold">{r.mappedCheque?.amount?.toLocaleString() || 0} PKR</td>
                    <td className="p-2.5 text-rose-600 dark:text-rose-400 font-medium">
                      {r.errors.length > 0 ? r.errors.join(' | ') : 'None'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* STEP 4: IMPORT SUMMARY */}
      {step === 4 && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50/60 p-8 text-center dark:border-emerald-900/50 dark:bg-emerald-950/20 space-y-4">
          <CheckCircle2 className="mx-auto h-12 w-12 text-emerald-600" />
          <h3 className="text-lg font-bold text-emerald-900 dark:text-emerald-300">
            Import Completed Successfully!
          </h3>
          <div className="flex justify-center gap-6 text-sm font-semibold">
            <div>
              Inserted Records: <strong className="text-emerald-700">{importSummary.inserted}</strong>
            </div>
            <div>
              Skipped/Duplicates: <strong className="text-slate-600">{importSummary.skipped}</strong>
            </div>
          </div>

          <button
            onClick={onComplete}
            className="mt-4 rounded-xl bg-blue-600 px-6 py-2.5 text-xs font-bold text-white shadow hover:bg-blue-700"
          >
            Go to Cheques Table
          </button>
        </div>
      )}
    </div>
  );
};

import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { Cheque, CompanySettings } from '../types';

export function formatCurrencyPKR(amount: number): string {
  return new Intl.NumberFormat('en-PK', {
    style: 'currency',
    currency: 'PKR',
    maximumFractionDigits: 0,
  }).format(amount).replace('PKR', 'Rs.');
}

export function exportToExcel(cheques: Cheque[], settings: CompanySettings, title = 'Cheque Management Report') {
  const dateStr = new Date().toLocaleDateString('en-PK', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const totalAmount = cheques.reduce((sum, c) => sum + c.amount, 0);
  const outstandingAmount = cheques.filter((c) => c.status === 'Outstanding').reduce((sum, c) => sum + c.amount, 0);
  const clearedAmount = cheques.filter((c) => c.status === 'Cleared').reduce((sum, c) => sum + c.amount, 0);

  // Header metadata rows
  const excelData: any[] = [
    [settings.companyName.toUpperCase()],
    [settings.tagline || 'Cheque Management System'],
    [`Report Title: ${title}`],
    [`Generated On: ${dateStr}`],
    [`Total Records: ${cheques.length} | Total Outstanding: ${formatCurrencyPKR(outstandingAmount)} | Total Cleared: ${formatCurrencyPKR(clearedAmount)}`],
    [], // Blank separator row
    [
      'Sr #',
      'Receive Date',
      'Party Name (Receive From)',
      'City',
      'Bank Name',
      'Cheque Number',
      'Cheque Date',
      'Amount (PKR)',
      'Received By',
      'Voucher Number',
      'Status',
      'Paid Date',
      'Paid To / Account',
      'Remarks',
    ],
  ];

  cheques.forEach((c, idx) => {
    excelData.push([
      idx + 1,
      c.receiveDate,
      c.receiveFrom,
      c.city,
      c.bank,
      c.chequeNumber,
      c.chequeDate,
      c.amount,
      c.receivedBy,
      c.voucherNumber || 'N/A',
      c.status,
      c.paidDate || '-',
      c.paidTo || '-',
      c.remarks || '',
    ]);
  });

  // Footer summary row
  excelData.push([]);
  excelData.push(['', '', '', '', '', '', 'GRAND TOTAL:', totalAmount, '', '', '', '', '', '']);

  const worksheet = XLSX.utils.aoa_to_sheet(excelData);

  // Set column widths
  worksheet['!cols'] = [
    { wch: 6 },  // Sr
    { wch: 14 }, // Rec Date
    { wch: 30 }, // Party
    { wch: 16 }, // City
    { wch: 26 }, // Bank
    { wch: 18 }, // Cheque No
    { wch: 14 }, // Cheque Date
    { wch: 18 }, // Amount
    { wch: 20 }, // Rec By
    { wch: 18 }, // Voucher
    { wch: 14 }, // Status
    { wch: 14 }, // Paid Date
    { wch: 22 }, // Paid To
    { wch: 30 }, // Remarks
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Cheques');

  const fileName = `SaleemDaal_${title.replace(/[^a-zA-Z0-9]/g, '_')}_${new Date().toISOString().slice(0, 10)}.xlsx`;
  XLSX.writeFile(workbook, fileName);
}

export function exportToCSV(cheques: Cheque[], settings: CompanySettings, title = 'Cheque_Export') {
  const headers = [
    'Sr No',
    'Receive Date',
    'Party Name',
    'City',
    'Bank',
    'Cheque Number',
    'Cheque Date',
    'Amount (PKR)',
    'Received By',
    'Voucher Number',
    'Status',
    'Paid Date',
    'Remarks',
  ];

  const rows = cheques.map((c, i) => [
    i + 1,
    `"${c.receiveDate}"`,
    `"${c.receiveFrom.replace(/"/g, '""')}"`,
    `"${c.city}"`,
    `"${c.bank.replace(/"/g, '""')}"`,
    `"${c.chequeNumber}"`,
    `"${c.chequeDate}"`,
    c.amount,
    `"${c.receivedBy}"`,
    `"${c.voucherNumber || ''}"`,
    `"${c.status}"`,
    `"${c.paidDate || ''}"`,
    `"${(c.remarks || '').replace(/"/g, '""')}"`,
  ]);

  const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `SaleemDaal_${title}_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function exportToPDF(cheques: Cheque[], settings: CompanySettings, title = 'Cheque Management Report') {
  const doc = new jsPDF('landscape', 'mm', 'a4');
  const totalAmount = cheques.reduce((sum, c) => sum + c.amount, 0);
  const outstandingAmount = cheques.filter((c) => c.status === 'Outstanding').reduce((sum, c) => sum + c.amount, 0);
  const clearedAmount = cheques.filter((c) => c.status === 'Cleared').reduce((sum, c) => sum + c.amount, 0);

  // Header Box
  doc.setFillColor(15, 23, 42); // Slate 900
  doc.rect(0, 0, 297, 24, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(255, 255, 255);
  doc.text(settings.companyName.toUpperCase(), 14, 11);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(203, 213, 225); // Slate 300
  doc.text(settings.tagline || 'Cheque Management System', 14, 17);

  const genDate = new Date().toLocaleString('en-PK');
  doc.text(`Generated: ${genDate}`, 283, 11, { align: 'right' });
  doc.text(`Total Records: ${cheques.length}`, 283, 17, { align: 'right' });

  // Subheader title & metrics
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(title, 14, 32);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(51, 65, 85);
  doc.text(
    `Total: ${formatCurrencyPKR(totalAmount)}   |   Outstanding: ${formatCurrencyPKR(outstandingAmount)}   |   Cleared: ${formatCurrencyPKR(clearedAmount)}`,
    14,
    38
  );

  // Table
  const tableData = cheques.map((c, index) => [
    index + 1,
    c.receiveDate,
    c.receiveFrom,
    c.city,
    c.bank,
    c.chequeNumber,
    c.chequeDate,
    formatCurrencyPKR(c.amount),
    c.voucherNumber || '-',
    c.status,
    c.paidDate || '-',
  ]);

  (doc as any).autoTable({
    startY: 42,
    head: [['#', 'Rec Date', 'Party Name', 'City', 'Bank', 'Cheque #', 'Chq Date', 'Amount', 'Voucher #', 'Status', 'Paid Date']],
    body: tableData,
    theme: 'grid',
    headStyles: {
      fillColor: [30, 64, 175], // Blue 800
      textColor: [255, 255, 255],
      fontSize: 8,
      fontStyle: 'bold',
      halign: 'left',
    },
    bodyStyles: {
      fontSize: 8,
      textColor: [30, 41, 59],
    },
    columnStyles: {
      0: { cellWidth: 8, halign: 'center' },
      1: { cellWidth: 18 },
      2: { cellWidth: 42 },
      3: { cellWidth: 22 },
      4: { cellWidth: 38 },
      5: { cellWidth: 26 },
      6: { cellWidth: 20 },
      7: { cellWidth: 28, halign: 'right' },
      8: { cellWidth: 24, halign: 'center' },
      9: { cellWidth: 22, halign: 'center' },
      10: { cellWidth: 20 },
    },
    didParseCell: (data: any) => {
      if (data.section === 'body' && data.column.index === 9) {
        if (data.cell.raw === 'Cleared') {
          data.cell.styles.textColor = [16, 185, 129]; // Green
          data.cell.styles.fontStyle = 'bold';
        } else {
          data.cell.styles.textColor = [239, 68, 68]; // Red
          data.cell.styles.fontStyle = 'bold';
        }
      }
    },
  });

  const finalY = (doc as any).lastAutoTable.finalY || 150;

  // Signatures at bottom
  const sigY = Math.max(finalY + 20, 180);
  if (sigY + 15 < 200) {
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(100, 116, 139);

    doc.line(20, sigY, 70, sigY);
    doc.text('PREPARED BY', 45, sigY + 5, { align: 'center' });

    doc.line(120, sigY, 170, sigY);
    doc.text('CHECKED BY', 145, sigY + 5, { align: 'center' });

    doc.line(220, sigY, 270, sigY);
    doc.text('AUTHORIZED SIGNATURE', 245, sigY + 5, { align: 'center' });
  }

  const fileName = `SaleemDaal_${title.replace(/[^a-zA-Z0-9]/g, '_')}_${new Date().toISOString().slice(0, 10)}.pdf`;
  doc.save(fileName);
}

export function printChequeList(cheques: Cheque[], settings: CompanySettings, title = 'Cheque Management Register') {
  const printWindow = window.open('', '_blank');
  if (!printWindow) return;

  const totalAmount = cheques.reduce((sum, c) => sum + c.amount, 0);
  const outstandingAmount = cheques.filter((c) => c.status === 'Outstanding').reduce((sum, c) => sum + c.amount, 0);
  const clearedAmount = cheques.filter((c) => c.status === 'Cleared').reduce((sum, c) => sum + c.amount, 0);

  const rowsHtml = cheques
    .map(
      (c, i) => `
    <tr>
      <td style="text-align: center;">${i + 1}</td>
      <td>${c.receiveDate}</td>
      <td><strong>${c.receiveFrom}</strong></td>
      <td>${c.city}</td>
      <td>${c.bank}</td>
      <td><code>${c.chequeNumber}</code></td>
      <td>${c.chequeDate}</td>
      <td style="text-align: right; font-weight: bold;">${formatCurrencyPKR(c.amount)}</td>
      <td style="text-align: center;">${c.voucherNumber || '-'}</td>
      <td style="text-align: center;">
        <span class="badge ${c.status.toLowerCase()}">${c.status}</span>
      </td>
      <td>${c.receivedBy}</td>
    </tr>
  `
    )
    .join('');

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>${settings.companyName} - ${title}</title>
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 20px; color: #1e293b; }
          .header { border-bottom: 2px solid #1e40af; padding-bottom: 12px; margin-bottom: 16px; display: flex; justify-content: space-between; align-items: flex-end; }
          .title { font-size: 22px; font-weight: bold; color: #0f172a; margin: 0; }
          .sub { font-size: 13px; color: #64748b; margin-top: 4px; }
          .summary { display: flex; gap: 20px; background: #f8fafc; border: 1px solid #e2e8f0; padding: 10px 16px; border-radius: 6px; margin-bottom: 16px; font-size: 13px; }
          table { width: 100%; border-collapse: collapse; font-size: 12px; }
          th { background: #1e40af; color: white; padding: 8px 10px; text-align: left; font-weight: 600; border: 1px solid #1e3a8a; }
          td { padding: 6px 10px; border: 1px solid #cbd5e1; }
          tr:nth-child(even) { background: #f8fafc; }
          .badge { padding: 2px 8px; border-radius: 4px; font-size: 11px; font-weight: bold; }
          .badge.cleared { background: #d1fae5; color: #065f46; }
          .badge.outstanding { background: #fee2e2; color: #991b1b; }
          .totals { font-weight: bold; background: #f1f5f9; }
          .signatures { margin-top: 50px; display: flex; justify-content: space-between; font-size: 12px; font-weight: bold; color: #64748b; }
          .sig-line { border-top: 1px solid #94a3b8; width: 180px; text-align: center; padding-top: 6px; }
          @media print {
            body { margin: 0; }
            .no-print { display: none; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div>
            <h1 class="title">${settings.companyName.toUpperCase()}</h1>
            <div class="sub">${settings.tagline || 'Cheque Management Register'} • ${settings.phone}</div>
          </div>
          <div style="text-align: right; font-size: 12px;">
            <strong>${title}</strong><br/>
            Date: ${new Date().toLocaleDateString('en-PK')}<br/>
            Total Records: ${cheques.length}
          </div>
        </div>

        <div class="summary">
          <div>Total Amount: <strong>${formatCurrencyPKR(totalAmount)}</strong></div>
          <div>Outstanding: <strong style="color: #dc2626;">${formatCurrencyPKR(outstandingAmount)}</strong></div>
          <div>Cleared: <strong style="color: #16a34a;">${formatCurrencyPKR(clearedAmount)}</strong></div>
        </div>

        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>Receive Date</th>
              <th>Party Name</th>
              <th>City</th>
              <th>Bank</th>
              <th>Cheque #</th>
              <th>Chq Date</th>
              <th style="text-align: right;">Amount</th>
              <th>Voucher #</th>
              <th>Status</th>
              <th>Received By</th>
            </tr>
          </thead>
          <tbody>
            ${rowsHtml}
            <tr class="totals">
              <td colspan="7" style="text-align: right;">GRAND TOTAL:</td>
              <td style="text-align: right;">${formatCurrencyPKR(totalAmount)}</td>
              <td colspan="3"></td>
            </tr>
          </tbody>
        </table>

        <div class="signatures">
          <div class="sig-line">PREPARED BY</div>
          <div class="sig-line">CHECKED BY</div>
          <div class="sig-line">AUTHORIZED SIGNATURE</div>
        </div>

        <script>
          window.onload = function() {
            window.print();
          };
        </script>
      </body>
    </html>
  `;

  printWindow.document.write(html);
  printWindow.document.close();
}

import React, { useState } from 'react';
import {
  FileText,
  FileSpreadsheet,
  FileDown,
  Printer,
  Calendar,
  Building2,
  Users2,
  MapPin,
  CheckCircle2,
  Clock,
  Filter,
} from 'lucide-react';
import { storageService } from '../../services/storageService';
import { Cheque, CompanySettings } from '../../types';
import {
  exportToExcel,
  exportToCSV,
  exportToPDF,
  printChequeList,
  formatCurrencyPKR,
} from '../../services/exportService';

export const ReportsView: React.FC = () => {
  const [cheques] = useState<Cheque[]>(storageService.getCheques());
  const [settings] = useState<CompanySettings>(storageService.getSettings());
  const banks = storageService.getBanks();
  const cities = storageService.getCities();
  const employees = storageService.getEmployees();
  const parties = storageService.getParties();

  const [reportType, setReportType] = useState<
    'all' | 'outstanding' | 'cleared' | 'bank' | 'city' | 'party' | 'employee'
  >('all');

  const [selectedBank, setSelectedBank] = useState<string>('');
  const [selectedCity, setSelectedCity] = useState<string>('');
  const [selectedParty, setSelectedParty] = useState<string>('');
  const [selectedEmployee, setSelectedEmployee] = useState<string>('');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');

  // Filter cheques based on report controls
  const filteredCheques = cheques.filter((c) => {
    if (c.isDeleted) return false;

    if (reportType === 'outstanding' && c.status !== 'Outstanding') return false;
    if (reportType === 'cleared' && c.status !== 'Cleared') return false;

    if (selectedBank && !c.bank.toLowerCase().includes(selectedBank.toLowerCase())) return false;
    if (selectedCity && c.city.toLowerCase() !== selectedCity.toLowerCase()) return false;
    if (selectedParty && c.receiveFrom.toLowerCase() !== selectedParty.toLowerCase()) return false;
    if (selectedEmployee && c.receivedBy.toLowerCase() !== selectedEmployee.toLowerCase()) return false;

    if (startDate && c.receiveDate < startDate) return false;
    if (endDate && c.receiveDate > endDate) return false;

    return true;
  });

  const totalAmount = filteredCheques.reduce((sum, c) => sum + c.amount, 0);
  const totalOutstanding = filteredCheques
    .filter((c) => c.status === 'Outstanding')
    .reduce((sum, c) => sum + c.amount, 0);
  const totalCleared = filteredCheques
    .filter((c) => c.status === 'Cleared')
    .reduce((sum, c) => sum + c.amount, 0);

  const reportTitle =
    reportType === 'outstanding'
      ? 'Outstanding Cheques Register'
      : reportType === 'cleared'
      ? 'Cleared Cheques Register'
      : reportType === 'bank'
      ? `Bank Cheque Report (${selectedBank || 'All Banks'})`
      : reportType === 'city'
      ? `City Distribution Report (${selectedCity || 'All Cities'})`
      : reportType === 'party'
      ? `Party Ledger Statement (${selectedParty || 'All Parties'})`
      : reportType === 'employee'
      ? `Employee Collection Report (${selectedEmployee || 'All Staff'})`
      : 'Comprehensive Cheque Management Statement';

  return (
    <div className="space-y-6">
      {/* Header & Export Actions */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-white">Financial Reports & Statements</h2>
          <p className="text-xs text-slate-500">Generate, print, and export official Saleem Daal Factory registers</p>
        </div>

        {/* Export Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => exportToExcel(filteredCheques, settings, reportTitle)}
            className="flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 shadow-sm transition hover:border-emerald-500 hover:text-emerald-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
          >
            <FileSpreadsheet className="h-4 w-4 text-emerald-600" />
            <span>Export Excel</span>
          </button>

          <button
            onClick={() => exportToPDF(filteredCheques, settings, reportTitle)}
            className="flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 shadow-sm transition hover:border-rose-500 hover:text-rose-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
          >
            <FileDown className="h-4 w-4 text-rose-600" />
            <span>Export PDF</span>
          </button>

          <button
            onClick={() => exportToCSV(filteredCheques, settings, reportTitle)}
            className="flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 shadow-sm transition hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
          >
            <FileText className="h-4 w-4 text-blue-600" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={() => printChequeList(filteredCheques, settings, reportTitle)}
            className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-1.5 text-xs font-bold text-white shadow transition hover:bg-blue-700"
          >
            <Printer className="h-4 w-4" />
            <span>Print Layout</span>
          </button>
        </div>
      </div>

      {/* Filter Presets & Selector Controls */}
      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-4">
        {/* Preset Type Buttons */}
        <div className="flex flex-wrap items-center gap-2 border-b border-slate-100 pb-3 dark:border-slate-800">
          <span className="text-xs font-bold text-slate-500 mr-2 flex items-center gap-1">
            <Filter className="h-3.5 w-3.5 text-blue-600" /> Preset Types:
          </span>

          <button
            onClick={() => {
              setReportType('all');
              setSelectedBank('');
              setSelectedCity('');
              setSelectedParty('');
              setSelectedEmployee('');
            }}
            className={`rounded-lg px-3 py-1 text-xs font-semibold transition ${
              reportType === 'all'
                ? 'bg-slate-900 text-white shadow dark:bg-white dark:text-slate-900'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300'
            }`}
          >
            All Cheques
          </button>

          <button
            onClick={() => setReportType('outstanding')}
            className={`rounded-lg px-3 py-1 text-xs font-semibold transition ${
              reportType === 'outstanding'
                ? 'bg-rose-600 text-white shadow'
                : 'bg-rose-50 text-rose-700 hover:bg-rose-100 dark:bg-rose-950/40 dark:text-rose-300'
            }`}
          >
            Outstanding Report
          </button>

          <button
            onClick={() => setReportType('cleared')}
            className={`rounded-lg px-3 py-1 text-xs font-semibold transition ${
              reportType === 'cleared'
                ? 'bg-emerald-600 text-white shadow'
                : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:text-emerald-300'
            }`}
          >
            Cleared Report
          </button>

          <button
            onClick={() => setReportType('bank')}
            className={`rounded-lg px-3 py-1 text-xs font-semibold transition ${
              reportType === 'bank'
                ? 'bg-blue-600 text-white shadow'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300'
            }`}
          >
            By Bank
          </button>

          <button
            onClick={() => setReportType('city')}
            className={`rounded-lg px-3 py-1 text-xs font-semibold transition ${
              reportType === 'city'
                ? 'bg-blue-600 text-white shadow'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300'
            }`}
          >
            By City
          </button>

          <button
            onClick={() => setReportType('party')}
            className={`rounded-lg px-3 py-1 text-xs font-semibold transition ${
              reportType === 'party'
                ? 'bg-blue-600 text-white shadow'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300'
            }`}
          >
            By Party
          </button>

          <button
            onClick={() => setReportType('employee')}
            className={`rounded-lg px-3 py-1 text-xs font-semibold transition ${
              reportType === 'employee'
                ? 'bg-blue-600 text-white shadow'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300'
            }`}
          >
            By Employee
          </button>
        </div>

        {/* Dynamic Selectors */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Select Bank</label>
            <select
              value={selectedBank}
              onChange={(e) => setSelectedBank(e.target.value)}
              className="w-full rounded-lg border border-slate-300 bg-white p-2 text-slate-800 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            >
              <option value="">All Drawee Banks</option>
              {banks.map((b) => (
                <option key={b.id} value={b.name}>
                  {b.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Select City</label>
            <select
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
              className="w-full rounded-lg border border-slate-300 bg-white p-2 text-slate-800 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            >
              <option value="">All Trade Cities</option>
              {cities.map((c) => (
                <option key={c.id} value={c.name}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Select Party</label>
            <select
              value={selectedParty}
              onChange={(e) => setSelectedParty(e.target.value)}
              className="w-full rounded-lg border border-slate-300 bg-white p-2 text-slate-800 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            >
              <option value="">All Parties</option>
              {parties.map((p) => (
                <option key={p.id} value={p.name}>
                  {p.name} ({p.city})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Select Employee</label>
            <select
              value={selectedEmployee}
              onChange={(e) => setSelectedEmployee(e.target.value)}
              className="w-full rounded-lg border border-slate-300 bg-white p-2 text-slate-800 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            >
              <option value="">All Officers / Collectors</option>
              {employees.map((e) => (
                <option key={e.id} value={e.name}>
                  {e.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">From Receive Date</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full rounded-lg border border-slate-300 bg-white p-2 text-slate-800 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">To Receive Date</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full rounded-lg border border-slate-300 bg-white p-2 text-slate-800 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            />
          </div>
        </div>
      </div>

      {/* Summary KPI Cards for Report */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <span className="text-xs font-bold text-slate-500 uppercase">Total Report Value</span>
          <div className="mt-1 text-2xl font-black text-slate-900 dark:text-white">
            {formatCurrencyPKR(totalAmount)}
          </div>
          <p className="mt-1 text-xs text-slate-500">{filteredCheques.length} Cheque Records</p>
        </div>

        <div className="rounded-xl border border-rose-100 bg-rose-50/50 p-4 shadow-sm dark:border-rose-900/30 dark:bg-rose-950/20">
          <span className="text-xs font-bold text-rose-700 dark:text-rose-400 uppercase">Outstanding Portion</span>
          <div className="mt-1 text-2xl font-black text-rose-700 dark:text-rose-400">
            {formatCurrencyPKR(totalOutstanding)}
          </div>
          <p className="mt-1 text-xs text-rose-600/80">
            {filteredCheques.filter((c) => c.status === 'Outstanding').length} Records Pending
          </p>
        </div>

        <div className="rounded-xl border border-emerald-100 bg-emerald-50/50 p-4 shadow-sm dark:border-emerald-900/30 dark:bg-emerald-950/20">
          <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400 uppercase">Cleared Portion</span>
          <div className="mt-1 text-2xl font-black text-emerald-700 dark:text-emerald-400">
            {formatCurrencyPKR(totalCleared)}
          </div>
          <p className="mt-1 text-xs text-emerald-600/80">
            {filteredCheques.filter((c) => c.status === 'Cleared').length} Records Cleared
          </p>
        </div>
      </div>

      {/* Preview Data Table */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden dark:border-slate-800 dark:bg-slate-900">
        <div className="bg-slate-900 px-4 py-3 text-white flex items-center justify-between">
          <h3 className="text-sm font-bold">{reportTitle}</h3>
          <span className="text-xs text-slate-300">{filteredCheques.length} rows</span>
        </div>

        <div className="overflow-x-auto max-h-[500px]">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="sticky top-0 bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 font-bold border-b border-slate-200 dark:border-slate-700">
              <tr>
                <th className="p-3 w-10 text-center">#</th>
                <th className="p-3">Rec Date</th>
                <th className="p-3">Party Name</th>
                <th className="p-3">City</th>
                <th className="p-3">Bank</th>
                <th className="p-3">Cheque #</th>
                <th className="p-3">Chq Date</th>
                <th className="p-3 text-right">Amount (PKR)</th>
                <th className="p-3">Voucher #</th>
                <th className="p-3 text-center">Status</th>
                <th className="p-3">Received By</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-slate-800 dark:divide-slate-800 dark:text-slate-200">
              {filteredCheques.map((c, i) => (
                <tr key={c.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                  <td className="p-3 text-center font-semibold text-slate-400">{i + 1}</td>
                  <td className="p-3">{c.receiveDate}</td>
                  <td className="p-3 font-bold text-slate-900 dark:text-white">{c.receiveFrom}</td>
                  <td className="p-3">{c.city}</td>
                  <td className="p-3">{c.bank}</td>
                  <td className="p-3 font-mono font-bold text-blue-700 dark:text-blue-400">{c.chequeNumber}</td>
                  <td className="p-3">{c.chequeDate}</td>
                  <td className="p-3 text-right font-bold">{formatCurrencyPKR(c.amount)}</td>
                  <td className="p-3 font-mono">{c.voucherNumber || '-'}</td>
                  <td className="p-3 text-center">
                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold ${
                        c.status === 'Cleared'
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-300'
                          : 'bg-rose-100 text-rose-800 dark:bg-rose-900 dark:text-rose-300'
                      }`}
                    >
                      {c.status}
                    </span>
                  </td>
                  <td className="p-3">{c.receivedBy}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

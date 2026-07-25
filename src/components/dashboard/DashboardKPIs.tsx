import React from 'react';
import {
  FileText,
  Clock,
  CheckCircle2,
  Banknote,
  CalendarDays,
  TrendingUp,
  AlertCircle,
  Building,
} from 'lucide-react';
import { Cheque } from '../../types';
import { formatCurrencyPKR } from '../../services/exportService';

interface DashboardKPIsProps {
  cheques: Cheque[];
  onSelectTab: (tab: string) => void;
}

export const DashboardKPIs: React.FC<DashboardKPIsProps> = ({ cheques, onSelectTab }) => {
  const activeCheques = cheques.filter((c) => !c.isDeleted);

  const totalCount = activeCheques.length;
  const totalAmount = activeCheques.reduce((sum, c) => sum + c.amount, 0);

  const outstandingCheques = activeCheques.filter((c) => c.status === 'Outstanding');
  const outstandingCount = outstandingCheques.length;
  const outstandingAmount = outstandingCheques.reduce((sum, c) => sum + c.amount, 0);

  const clearedCheques = activeCheques.filter((c) => c.status === 'Cleared');
  const clearedCount = clearedCheques.length;
  const clearedAmount = clearedCheques.reduce((sum, c) => sum + c.amount, 0);

  const todayStr = new Date().toISOString().split('T')[0];
  const todaysCheques = activeCheques.filter((c) => c.receiveDate === todayStr);

  const currentMonthPrefix = new Date().toISOString().slice(0, 7); // YYYY-MM
  const monthlyCheques = activeCheques.filter((c) => c.receiveDate.startsWith(currentMonthPrefix));

  // Average Clearing Days calculation
  let totalDays = 0;
  let clearedWithDates = 0;
  clearedCheques.forEach((c) => {
    if (c.paidDate && c.receiveDate) {
      const d1 = new Date(c.receiveDate).getTime();
      const d2 = new Date(c.paidDate).getTime();
      const diff = Math.max(0, Math.round((d2 - d1) / (1000 * 60 * 60 * 24)));
      totalDays += diff;
      clearedWithDates++;
    }
  });
  const avgClearingDays = clearedWithDates > 0 ? (totalDays / clearedWithDates).toFixed(1) : '1.5';

  // Largest Outstanding
  const largestOutstanding = [...outstandingCheques].sort((a, b) => b.amount - a.amount)[0];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {/* Total Cheques */}
      <div
        onClick={() => onSelectTab('cheques')}
        className="group cursor-pointer rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition hover:border-blue-300 hover:shadow-md dark:border-slate-800 dark:bg-slate-900"
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Total Cheques
          </span>
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-900/40 dark:text-blue-400">
            <FileText className="h-5 w-5" />
          </div>
        </div>
        <div className="mt-2 flex items-baseline justify-between">
          <span className="text-2xl font-extrabold text-slate-900 dark:text-white">{totalCount}</span>
          <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">
            {formatCurrencyPKR(totalAmount)}
          </span>
        </div>
        <div className="mt-2 text-[11px] text-slate-500 dark:text-slate-400">All recorded incoming cheques</div>
      </div>

      {/* Outstanding Cheques */}
      <div
        onClick={() => onSelectTab('outstanding')}
        className="group cursor-pointer rounded-xl border border-rose-100 bg-rose-50/40 p-4 shadow-sm transition hover:border-rose-300 hover:shadow-md dark:border-rose-900/30 dark:bg-rose-950/20"
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-rose-700 dark:text-rose-400">
            Outstanding Amount
          </span>
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-rose-100 text-rose-600 dark:bg-rose-900/50 dark:text-rose-400">
            <Clock className="h-5 w-5" />
          </div>
        </div>
        <div className="mt-2 flex items-baseline justify-between">
          <span className="text-2xl font-extrabold text-rose-700 dark:text-rose-400">{outstandingCount}</span>
          <span className="text-lg font-bold text-rose-700 dark:text-rose-400">
            {formatCurrencyPKR(outstandingAmount)}
          </span>
        </div>
        <div className="mt-2 text-[11px] font-medium text-rose-600/80 dark:text-rose-400/80">
          Awaiting Voucher Clearance
        </div>
      </div>

      {/* Cleared Cheques */}
      <div
        onClick={() => onSelectTab('cleared')}
        className="group cursor-pointer rounded-xl border border-emerald-100 bg-emerald-50/40 p-4 shadow-sm transition hover:border-emerald-300 hover:shadow-md dark:border-emerald-900/30 dark:bg-emerald-950/20"
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
            Cleared Amount
          </span>
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-100 text-emerald-600 dark:bg-emerald-900/50 dark:text-emerald-400">
            <CheckCircle2 className="h-5 w-5" />
          </div>
        </div>
        <div className="mt-2 flex items-baseline justify-between">
          <span className="text-2xl font-extrabold text-emerald-700 dark:text-emerald-400">{clearedCount}</span>
          <span className="text-lg font-bold text-emerald-700 dark:text-emerald-400">
            {formatCurrencyPKR(clearedAmount)}
          </span>
        </div>
        <div className="mt-2 text-[11px] font-medium text-emerald-600/80 dark:text-emerald-400/80">
          Vouchers Applied & Cleared
        </div>
      </div>

      {/* Monthly Collections / Average Clearing */}
      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Monthly Performance
          </span>
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300">
            <TrendingUp className="h-5 w-5" />
          </div>
        </div>
        <div className="mt-2 flex items-baseline justify-between">
          <div>
            <span className="text-xl font-bold text-slate-900 dark:text-white">{monthlyCheques.length}</span>
            <span className="ml-1 text-xs text-slate-500">This Month</span>
          </div>
          <div className="text-right">
            <span className="text-sm font-bold text-blue-600 dark:text-blue-400">{avgClearingDays} Days</span>
            <span className="block text-[10px] text-slate-500">Avg Clear Time</span>
          </div>
        </div>
        {largestOutstanding && (
          <div className="mt-2 truncate border-t border-slate-100 pt-1.5 text-[11px] text-slate-600 dark:border-slate-800 dark:text-slate-400">
            <span className="font-semibold text-rose-600">Top Pending:</span> {largestOutstanding.receiveFrom} (
            {formatCurrencyPKR(largestOutstanding.amount)})
          </div>
        )}
      </div>
    </div>
  );
};

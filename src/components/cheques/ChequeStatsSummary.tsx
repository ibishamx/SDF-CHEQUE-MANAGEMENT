import React from 'react';
import { FileSpreadsheet, Clock, CheckCircle2, RotateCcw } from 'lucide-react';
import { Cheque, FilterState } from '../../types';
import { formatCurrencyPKR } from '../../services/exportService';

interface ChequeStatsSummaryProps {
  cheques: Cheque[];
  filter: FilterState;
  onFilterChange: (newFilter: Partial<FilterState>) => void;
}

export const ChequeStatsSummary: React.FC<ChequeStatsSummaryProps> = ({
  cheques,
  filter,
  onFilterChange,
}) => {
  const activeCheques = cheques.filter((c) => !c.isDeleted);

  const totalQty = activeCheques.length;
  const totalAmount = activeCheques.reduce((sum, c) => sum + c.amount, 0);

  const outstandingList = activeCheques.filter((c) => c.status === 'Outstanding');
  const outstandingQty = outstandingList.length;
  const outstandingAmount = outstandingList.reduce((sum, c) => sum + c.amount, 0);

  const clearedList = activeCheques.filter((c) => c.status === 'Cleared');
  const clearedQty = clearedList.length;
  const clearedAmount = clearedList.reduce((sum, c) => sum + c.amount, 0);

  const returnedList = activeCheques.filter((c) => c.status === 'Returned');
  const returnedQty = returnedList.length;
  const returnedAmount = returnedList.reduce((sum, c) => sum + c.amount, 0);

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {/* 1. Total Cheques */}
      <button
        onClick={() => onFilterChange({ status: '' })}
        className={`flex flex-col justify-between rounded-xl border p-3.5 text-left transition shadow-sm hover:shadow-md ${
          !filter.status
            ? 'border-blue-500 bg-blue-50/80 ring-2 ring-blue-500/20 dark:border-blue-600 dark:bg-blue-950/40'
            : 'border-slate-200 bg-white hover:border-blue-300 dark:border-slate-800 dark:bg-slate-900'
        }`}
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Total Registered
          </span>
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100 text-blue-600 dark:bg-blue-900/60 dark:text-blue-300">
            <FileSpreadsheet className="h-4 w-4" />
          </div>
        </div>
        <div className="mt-2 space-y-0.5">
          <div className="flex items-baseline justify-between">
            <span className="text-xl font-extrabold text-slate-900 dark:text-white">
              {formatCurrencyPKR(totalAmount)}
            </span>
          </div>
          <p className="text-xs font-bold text-blue-700 dark:text-blue-400">
            Quantity: <span className="font-extrabold">{totalQty}</span> Cheques
          </p>
        </div>
      </button>

      {/* 2. Outstanding Cheques */}
      <button
        onClick={() => onFilterChange({ status: 'Outstanding' })}
        className={`flex flex-col justify-between rounded-xl border p-3.5 text-left transition shadow-sm hover:shadow-md ${
          filter.status === 'Outstanding'
            ? 'border-rose-500 bg-rose-50/80 ring-2 ring-rose-500/20 dark:border-rose-600 dark:bg-rose-950/40'
            : 'border-slate-200 bg-white hover:border-rose-300 dark:border-slate-800 dark:bg-slate-900'
        }`}
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400">
            Outstanding (Awaiting)
          </span>
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-rose-100 text-rose-600 dark:bg-rose-900/60 dark:text-rose-300">
            <Clock className="h-4 w-4" />
          </div>
        </div>
        <div className="mt-2 space-y-0.5">
          <div className="flex items-baseline justify-between">
            <span className="text-xl font-extrabold text-rose-600 dark:text-rose-400">
              {formatCurrencyPKR(outstandingAmount)}
            </span>
          </div>
          <p className="text-xs font-bold text-rose-700 dark:text-rose-300">
            Quantity: <span className="font-extrabold">{outstandingQty}</span> Cheques
          </p>
        </div>
      </button>

      {/* 3. Cleared Cheques */}
      <button
        onClick={() => onFilterChange({ status: 'Cleared' })}
        className={`flex flex-col justify-between rounded-xl border p-3.5 text-left transition shadow-sm hover:shadow-md ${
          filter.status === 'Cleared'
            ? 'border-emerald-500 bg-emerald-50/80 ring-2 ring-emerald-500/20 dark:border-emerald-600 dark:bg-emerald-950/40'
            : 'border-slate-200 bg-white hover:border-emerald-300 dark:border-slate-800 dark:bg-slate-900'
        }`}
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
            Cleared (Voucher)
          </span>
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-100 text-emerald-600 dark:bg-emerald-900/60 dark:text-emerald-300">
            <CheckCircle2 className="h-4 w-4" />
          </div>
        </div>
        <div className="mt-2 space-y-0.5">
          <div className="flex items-baseline justify-between">
            <span className="text-xl font-extrabold text-emerald-600 dark:text-emerald-400">
              {formatCurrencyPKR(clearedAmount)}
            </span>
          </div>
          <p className="text-xs font-bold text-emerald-700 dark:text-emerald-300">
            Quantity: <span className="font-extrabold">{clearedQty}</span> Cheques
          </p>
        </div>
      </button>

      {/* 4. Returned to Customer */}
      <button
        onClick={() => onFilterChange({ status: 'Returned' })}
        className={`flex flex-col justify-between rounded-xl border p-3.5 text-left transition shadow-sm hover:shadow-md ${
          filter.status === 'Returned'
            ? 'border-amber-500 bg-amber-50/80 ring-2 ring-amber-500/20 dark:border-amber-600 dark:bg-amber-950/40'
            : 'border-slate-200 bg-white hover:border-amber-300 dark:border-slate-800 dark:bg-slate-900'
        }`}
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
            Returned to Customer
          </span>
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-100 text-amber-600 dark:bg-amber-900/60 dark:text-amber-300">
            <RotateCcw className="h-4 w-4" />
          </div>
        </div>
        <div className="mt-2 space-y-0.5">
          <div className="flex items-baseline justify-between">
            <span className="text-xl font-extrabold text-amber-600 dark:text-amber-400">
              {formatCurrencyPKR(returnedAmount)}
            </span>
          </div>
          <p className="text-xs font-bold text-amber-700 dark:text-amber-300">
            Quantity: <span className="font-extrabold">{returnedQty}</span> Cheques
          </p>
        </div>
      </button>
    </div>
  );
};

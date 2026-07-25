import React, { useState } from 'react';
import { Filter, RotateCcw, ChevronDown, ChevronUp, SlidersHorizontal } from 'lucide-react';
import { FilterState, Bank, City, Employee } from '../../types';

interface QuickFilterBarProps {
  filter: FilterState;
  onFilterChange: (updates: Partial<FilterState>) => void;
  onResetFilter: () => void;
  banks: Bank[];
  cities: City[];
  employees: Employee[];
}

export const QuickFilterBar: React.FC<QuickFilterBarProps> = ({
  filter,
  onFilterChange,
  onResetFilter,
  banks,
  cities,
  employees,
}) => {
  const [isExpanded, setIsExpanded] = useState<boolean>(true);

  // Calculate count of active filters
  const activeFiltersCount = [
    filter.status !== 'ALL',
    Boolean(filter.bank),
    Boolean(filter.city),
    Boolean(filter.employee),
    Boolean(filter.startDate),
    Boolean(filter.endDate),
    filter.minAmount !== undefined,
    filter.maxAmount !== undefined,
  ].filter(Boolean).length;

  const hasActiveFilters = activeFiltersCount > 0;

  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-3.5 transition-all shadow-sm dark:border-slate-800 dark:bg-slate-900/60">
      {/* Filter Section Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2.5">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-100 text-blue-600 dark:bg-blue-900/50 dark:text-blue-300">
            <SlidersHorizontal className="h-4 w-4" />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
              Filter Records
            </span>
            {hasActiveFilters && (
              <span className="rounded-full bg-blue-600 px-2 py-0.5 text-[10px] font-extrabold text-white shadow-sm">
                {activeFiltersCount} Active
              </span>
            )}
          </div>
        </div>

        {/* Action Controls & Toggle Button */}
        <div className="flex items-center gap-2">
          {/* Quick Status Pills (Visible even when collapsed or expanded) */}
          <div className="hidden sm:flex items-center gap-1">
            <button
              onClick={() => onFilterChange({ status: 'ALL' })}
              className={`rounded-lg px-2.5 py-1 text-xs font-bold transition ${
                filter.status === 'ALL'
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700'
              }`}
            >
              All
            </button>

            <button
              onClick={() => onFilterChange({ status: 'Outstanding' })}
              className={`rounded-lg px-2.5 py-1 text-xs font-bold transition ${
                filter.status === 'Outstanding'
                  ? 'bg-rose-600 text-white'
                  : 'bg-white text-rose-700 border border-rose-200 hover:bg-rose-50 dark:bg-slate-800 dark:text-rose-400 dark:border-rose-900/50'
              }`}
            >
              Outstanding
            </button>

            <button
              onClick={() => onFilterChange({ status: 'Cleared' })}
              className={`rounded-lg px-2.5 py-1 text-xs font-bold transition ${
                filter.status === 'Cleared'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-white text-emerald-700 border border-emerald-200 hover:bg-emerald-50 dark:bg-slate-800 dark:text-emerald-400 dark:border-emerald-900/50'
              }`}
            >
              Cleared
            </button>

            <button
              onClick={() => onFilterChange({ status: 'Returned' })}
              className={`rounded-lg px-2.5 py-1 text-xs font-bold transition ${
                filter.status === 'Returned'
                  ? 'bg-amber-600 text-white'
                  : 'bg-white text-amber-700 border border-amber-200 hover:bg-amber-50 dark:bg-slate-800 dark:text-amber-400 dark:border-amber-900/50'
              }`}
            >
              Returned
            </button>
          </div>

          {hasActiveFilters && (
            <button
              onClick={onResetFilter}
              className="flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-bold text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span className="hidden min-[480px]:inline">Reset</span>
            </button>
          )}

          {/* Hide / Show Toggle Button */}
          <button
            onClick={() => setIsExpanded((prev) => !prev)}
            className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-1 text-xs font-bold text-white shadow-sm hover:bg-blue-700 transition active:scale-95"
            title={isExpanded ? 'Hide detailed filter options' : 'Show detailed filter options'}
          >
            <Filter className="h-3.5 w-3.5" />
            <span>{isExpanded ? 'Hide Filters' : 'Show Filters'}</span>
            {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {/* Expandable Detailed Dropdown Filters */}
      {isExpanded && (
        <div className="mt-3.5 pt-3 border-t border-slate-200 dark:border-slate-800 space-y-3">
          {/* Mobile Status Pills (if screen is small) */}
          <div className="flex sm:hidden flex-wrap items-center gap-1.5 pb-2">
            <button
              onClick={() => onFilterChange({ status: 'ALL' })}
              className={`rounded-lg px-2.5 py-1 text-xs font-bold ${
                filter.status === 'ALL'
                  ? 'bg-slate-900 text-white'
                  : 'bg-white text-slate-600 border border-slate-200'
              }`}
            >
              All
            </button>            <button
              onClick={() => onFilterChange({ status: 'Outstanding' })}
              className={`rounded-lg px-2.5 py-1 text-xs font-bold ${
                filter.status === 'Outstanding'
                  ? 'bg-rose-600 text-white'
                  : 'bg-white text-rose-700 border border-rose-200'
              }`}
            >
              Outstanding
            </button>
            <button
              onClick={() => onFilterChange({ status: 'Cleared' })}
              className={`rounded-lg px-2.5 py-1 text-xs font-bold ${
                filter.status === 'Cleared'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-white text-emerald-700 border border-emerald-200'
              }`}
            >
              Cleared
            </button>
            <button
              onClick={() => onFilterChange({ status: 'Returned' })}
              className={`rounded-lg px-2.5 py-1 text-xs font-bold ${
                filter.status === 'Returned'
                  ? 'bg-amber-600 text-white'
                  : 'bg-white text-amber-700 border border-amber-200'
              }`}
            >
              Returned
            </button>
          </div>

          <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
            {/* City Filter */}
            <div>
              <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                City
              </label>
              <select
                value={filter.city || ''}
                onChange={(e) => onFilterChange({ city: e.target.value || undefined })}
                className="w-full rounded-lg border border-slate-300 bg-white py-1.5 px-2.5 text-xs font-medium text-slate-800 focus:border-blue-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
              >
                <option value="">All Cities</option>
                {cities.map((c) => (
                  <option key={c.id} value={c.name}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Bank Filter */}
            <div>
              <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                Bank
              </label>
              <select
                value={filter.bank || ''}
                onChange={(e) => onFilterChange({ bank: e.target.value || undefined })}
                className="w-full rounded-lg border border-slate-300 bg-white py-1.5 px-2.5 text-xs font-medium text-slate-800 focus:border-blue-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
              >
                <option value="">All Banks</option>
                {banks.map((b) => (
                  <option key={b.id} value={b.name}>
                    {b.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Employee / Collector Filter */}
            <div>
              <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                Collector / Employee
              </label>
              <select
                value={filter.employee || ''}
                onChange={(e) => onFilterChange({ employee: e.target.value || undefined })}
                className="w-full rounded-lg border border-slate-300 bg-white py-1.5 px-2.5 text-xs font-medium text-slate-800 focus:border-blue-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
              >
                <option value="">All Collectors</option>
                {employees.map((e) => (
                  <option key={e.id} value={e.name}>
                    {e.name}
                  </option>
                ))}
              </select>
            </div>

            {/* From Receive Date */}
            <div>
              <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                From Date
              </label>
              <input
                type="date"
                value={filter.startDate || ''}
                onChange={(e) => onFilterChange({ startDate: e.target.value || undefined })}
                className="w-full rounded-lg border border-slate-300 bg-white py-1.5 px-2.5 text-xs font-medium text-slate-800 focus:border-blue-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
              />
            </div>

            {/* To Receive Date */}
            <div>
              <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                To Date
              </label>
              <input
                type="date"
                value={filter.endDate || ''}
                onChange={(e) => onFilterChange({ endDate: e.target.value || undefined })}
                className="w-full rounded-lg border border-slate-300 bg-white py-1.5 px-2.5 text-xs font-medium text-slate-800 focus:border-blue-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};


import React, { useState } from 'react';
import {
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Eye,
  Edit2,
  Copy,
  Trash2,
  CheckCircle2,
  Clock,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  FileSpreadsheet,
} from 'lucide-react';
import { Cheque, SortState } from '../../types';
import { formatCurrencyPKR } from '../../services/exportService';

interface ChequeTableProps {
  cheques: Cheque[];
  selectedIds: string[];
  onToggleSelect: (id: string) => void;
  onToggleSelectAll: (allIds: string[]) => void;
  onViewDetail: (cheque: Cheque) => void;
  onEdit: (cheque: Cheque) => void;
  onDuplicate: (cheque: Cheque) => void;
  onDelete: (id: string) => void;
}

export const ChequeTable: React.FC<ChequeTableProps> = ({
  cheques,
  selectedIds,
  onToggleSelect,
  onToggleSelectAll,
  onViewDetail,
  onEdit,
  onDuplicate,
  onDelete,
}) => {
  const [sort, setSort] = useState<SortState>({ field: 'receiveDate', direction: 'desc' });
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);

  const handleSort = (field: keyof Cheque) => {
    if (sort.field === field) {
      setSort({ field, direction: sort.direction === 'asc' ? 'desc' : 'asc' });
    } else {
      setSort({ field, direction: 'asc' });
    }
  };

  // Sorting
  const sortedCheques = [...cheques].sort((a, b) => {
    let valA: any = a[sort.field] ?? '';
    let valB: any = b[sort.field] ?? '';

    if (typeof valA === 'string') valA = valA.toLowerCase();
    if (typeof valB === 'string') valB = valB.toLowerCase();

    if (valA < valB) return sort.direction === 'asc' ? -1 : 1;
    if (valA > valB) return sort.direction === 'asc' ? 1 : -1;
    return 0;
  });

  // Pagination
  const totalRecords = sortedCheques.length;
  const totalPages = Math.ceil(totalRecords / pageSize) || 1;
  const currentPage = Math.min(page, totalPages);
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedCheques = sortedCheques.slice(startIndex, startIndex + pageSize);

  const allPaginatedIds = paginatedCheques.map((c) => c.id);
  const isAllSelected =
    allPaginatedIds.length > 0 && allPaginatedIds.every((id) => selectedIds.includes(id));

  // Totals for current view
  const totalAmount = sortedCheques.reduce((sum, c) => sum + c.amount, 0);
  const totalOutstanding = sortedCheques
    .filter((c) => c.status === 'Outstanding')
    .reduce((sum, c) => sum + c.amount, 0);
  const totalCleared = sortedCheques
    .filter((c) => c.status === 'Cleared')
    .reduce((sum, c) => sum + c.amount, 0);
  const totalReturned = sortedCheques
    .filter((c) => c.status === 'Returned')
    .reduce((sum, c) => sum + c.amount, 0);

  const renderSortIcon = (field: keyof Cheque) => {
    if (sort.field !== field) return <ArrowUpDown className="h-3 w-3 text-slate-400 opacity-60" />;
    return sort.direction === 'asc' ? (
      <ArrowUp className="h-3 w-3 text-blue-600 dark:text-blue-400" />
    ) : (
      <ArrowDown className="h-3 w-3 text-blue-600 dark:text-blue-400" />
    );
  };

  return (
    <div className="flex flex-col rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900 overflow-hidden">
      {/* Table Content */}
      <div className="overflow-x-auto max-h-[600px]">
        <table className="w-full text-left text-xs border-collapse">
          {/* Sticky Header */}
          <thead className="sticky top-0 z-10 bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 font-bold border-b border-slate-200 dark:border-slate-700">
            <tr>
              <th className="p-3 w-10 text-center">
                <input
                  type="checkbox"
                  checked={isAllSelected}
                  onChange={() => onToggleSelectAll(allPaginatedIds)}
                  className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />
              </th>
              <th className="p-3 w-10 text-center">#</th>

              <th
                onClick={() => handleSort('receiveDate')}
                className="p-3 cursor-pointer select-none hover:bg-slate-200 dark:hover:bg-slate-700"
              >
                <div className="flex items-center gap-1">
                  <span>Rec Date</span>
                  {renderSortIcon('receiveDate')}
                </div>
              </th>

              <th
                onClick={() => handleSort('receiveFrom')}
                className="p-3 cursor-pointer select-none hover:bg-slate-200 dark:hover:bg-slate-700 min-w-[180px]"
              >
                <div className="flex items-center gap-1">
                  <span>Party Name (Receive From)</span>
                  {renderSortIcon('receiveFrom')}
                </div>
              </th>

              <th
                onClick={() => handleSort('city')}
                className="p-3 cursor-pointer select-none hover:bg-slate-200 dark:hover:bg-slate-700"
              >
                <div className="flex items-center gap-1">
                  <span>City</span>
                  {renderSortIcon('city')}
                </div>
              </th>

              <th
                onClick={() => handleSort('bank')}
                className="p-3 cursor-pointer select-none hover:bg-slate-200 dark:hover:bg-slate-700 min-w-[160px]"
              >
                <div className="flex items-center gap-1">
                  <span>Bank</span>
                  {renderSortIcon('bank')}
                </div>
              </th>

              <th
                onClick={() => handleSort('chequeNumber')}
                className="p-3 cursor-pointer select-none hover:bg-slate-200 dark:hover:bg-slate-700"
              >
                <div className="flex items-center gap-1">
                  <span>Cheque #</span>
                  {renderSortIcon('chequeNumber')}
                </div>
              </th>

              <th
                onClick={() => handleSort('chequeDate')}
                className="p-3 cursor-pointer select-none hover:bg-slate-200 dark:hover:bg-slate-700"
              >
                <div className="flex items-center gap-1">
                  <span>Cheque Date</span>
                  {renderSortIcon('chequeDate')}
                </div>
              </th>

              <th
                onClick={() => handleSort('amount')}
                className="p-3 text-right cursor-pointer select-none hover:bg-slate-200 dark:hover:bg-slate-700"
              >
                <div className="flex items-center justify-end gap-1">
                  <span>Amount (PKR)</span>
                  {renderSortIcon('amount')}
                </div>
              </th>

              <th
                onClick={() => handleSort('receivedBy')}
                className="p-3 cursor-pointer select-none hover:bg-slate-200 dark:hover:bg-slate-700"
              >
                <div className="flex items-center gap-1">
                  <span>Received By</span>
                  {renderSortIcon('receivedBy')}
                </div>
              </th>

              <th
                onClick={() => handleSort('voucherNumber')}
                className="p-3 cursor-pointer select-none hover:bg-slate-200 dark:hover:bg-slate-700"
              >
                <div className="flex items-center gap-1">
                  <span>Voucher #</span>
                  {renderSortIcon('voucherNumber')}
                </div>
              </th>

              <th
                onClick={() => handleSort('paidTo')}
                className="p-3 cursor-pointer select-none hover:bg-slate-200 dark:hover:bg-slate-700 min-w-[150px]"
              >
                <div className="flex items-center gap-1">
                  <span>Paid To Party Name</span>
                  {renderSortIcon('paidTo')}
                </div>
              </th>

              <th
                onClick={() => handleSort('status')}
                className="p-3 text-center cursor-pointer select-none hover:bg-slate-200 dark:hover:bg-slate-700"
              >
                <div className="flex items-center justify-center gap-1">
                  <span>Status</span>
                  {renderSortIcon('status')}
                </div>
              </th>

              <th className="p-3 text-center w-28">Actions</th>
            </tr>
          </thead>

          {/* Table Body */}
          <tbody className="divide-y divide-slate-200 text-slate-800 dark:divide-slate-800 dark:text-slate-200">
            {paginatedCheques.length === 0 ? (
              <tr>
                <td colSpan={14} className="p-12 text-center text-slate-500">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <FileSpreadsheet className="h-8 w-8 text-slate-400" />
                    <p className="text-sm font-semibold">No cheque records match your search or filter.</p>
                    <p className="text-xs text-slate-400">Try adjusting your filters or search query.</p>
                  </div>
                </td>
              </tr>
            ) : (
              paginatedCheques.map((c, idx) => {
                const isSelected = selectedIds.includes(c.id);
                return (
                  <tr
                    key={c.id}
                    className={`transition ${
                      isSelected
                        ? 'bg-blue-50/80 dark:bg-blue-950/40'
                        : idx % 2 === 1
                        ? 'bg-slate-50/60 dark:bg-slate-800/30'
                        : 'hover:bg-slate-100/50 dark:hover:bg-slate-800/60'
                    }`}
                  >
                    <td className="p-3 text-center">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => onToggleSelect(c.id)}
                        className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                      />
                    </td>
                    <td className="p-3 text-center font-semibold text-slate-400">
                      {startIndex + idx + 1}
                    </td>

                    <td className="p-3 font-medium whitespace-nowrap">{c.receiveDate}</td>

                    <td className="p-3 font-bold text-slate-900 dark:text-white">
                      <button
                        onClick={() => onViewDetail(c)}
                        className="text-left hover:text-blue-600 hover:underline"
                      >
                        {c.receiveFrom}
                      </button>
                    </td>

                    <td className="p-3 text-slate-600 dark:text-slate-300">{c.city}</td>

                    <td className="p-3 text-slate-600 dark:text-slate-300">{c.bank}</td>

                    <td className="p-3 font-mono font-bold text-blue-700 dark:text-blue-400">
                      {c.chequeNumber}
                    </td>

                    <td className="p-3 text-slate-600 dark:text-slate-300 whitespace-nowrap">
                      {c.chequeDate}
                    </td>

                    <td className="p-3 text-right font-bold text-slate-900 dark:text-white whitespace-nowrap">
                      {formatCurrencyPKR(c.amount)}
                    </td>

                    <td className="p-3 text-slate-600 dark:text-slate-300">{c.receivedBy}</td>

                    <td className="p-3 font-mono text-slate-600 dark:text-slate-300">
                      {c.voucherNumber ? (
                        <span className="font-semibold text-slate-900 dark:text-slate-100">
                          {c.voucherNumber}
                        </span>
                      ) : (
                        <span className="text-slate-400 italic">-</span>
                      )}
                    </td>

                    <td className="p-3 text-slate-700 dark:text-slate-200 font-medium">
                      {c.paidTo ? (
                        <span>{c.paidTo}</span>
                      ) : (
                        <span className="text-slate-400 italic">-</span>
                      )}
                    </td>

                    {/* Automatic Status Badge */}
                    <td className="p-3 text-center whitespace-nowrap">
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-bold ${
                          c.status === 'Cleared'
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300'
                            : c.status === 'Returned'
                            ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300'
                            : 'bg-rose-100 text-rose-800 dark:bg-rose-950/80 dark:text-rose-300'
                        }`}
                      >
                        {c.status === 'Cleared' ? (
                          <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                        ) : c.status === 'Returned' ? (
                          <RotateCcw className="h-3 w-3 text-amber-600" />
                        ) : (
                          <Clock className="h-3 w-3 text-rose-600" />
                        )}
                        {c.status === 'Returned' ? 'Returned' : c.status}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="p-3 text-center whitespace-nowrap">
                      <div className="flex items-center justify-center gap-1.5">
                        {c.status === 'Outstanding' && (
                          <button
                            onClick={() => onEdit({ ...c, status: 'Cleared' })}
                            className="inline-flex items-center gap-1 rounded-lg bg-emerald-600 px-2.5 py-1 text-xs font-bold text-white shadow-sm hover:bg-emerald-700 active:scale-95 transition"
                            title="Click to Clear Cheque with Voucher Number"
                          >
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            <span>Clear Cheque</span>
                          </button>
                        )}
                        <button
                          onClick={() => onViewDetail(c)}
                          title="View Detail Voucher"
                          className="rounded-md p-1.5 text-slate-500 hover:bg-slate-200 hover:text-slate-900 dark:hover:bg-slate-700 dark:hover:text-white"
                        >
                          <Eye className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => onEdit(c)}
                          title="Edit Record"
                          className="rounded-md p-1.5 text-slate-500 hover:bg-slate-200 hover:text-blue-600 dark:hover:bg-slate-700 dark:hover:text-blue-400"
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => onDuplicate(c)}
                          title="Duplicate Entry"
                          className="rounded-md p-1.5 text-slate-500 hover:bg-slate-200 hover:text-slate-900 dark:hover:bg-slate-700 dark:hover:text-white"
                        >
                          <Copy className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`Delete Cheque #${c.chequeNumber}?`)) {
                              onDelete(c.id);
                            }
                          }}
                          title="Delete Record"
                          className="rounded-md p-1.5 text-slate-500 hover:bg-rose-100 hover:text-rose-600 dark:hover:bg-rose-950/50"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Footer Totals Summary & Pagination Controls */}
      <div className="flex flex-col gap-3 border-t border-slate-200 bg-slate-50 p-3 sm:flex-row sm:items-center sm:justify-between dark:border-slate-800 dark:bg-slate-900/80">
        {/* Table Metrics Summary */}
        <div className="flex flex-wrap items-center gap-4 text-xs font-medium text-slate-600 dark:text-slate-400">
          <div>
            Total Records: <strong className="text-slate-900 dark:text-white">{totalRecords}</strong>
          </div>
          <div>
            Total Amount: <strong className="text-slate-900 dark:text-white">{formatCurrencyPKR(totalAmount)}</strong>
          </div>
          <div>
            Outstanding:{' '}
            <strong className="text-rose-600 dark:text-rose-400">{formatCurrencyPKR(totalOutstanding)}</strong>
          </div>
          <div>
            Cleared:{' '}
            <strong className="text-emerald-600 dark:text-emerald-400">{formatCurrencyPKR(totalCleared)}</strong>
          </div>
          <div>
            Returned:{' '}
            <strong className="text-amber-600 dark:text-amber-400">{formatCurrencyPKR(totalReturned)}</strong>
          </div>
        </div>

        {/* Pagination Controls */}
        <div className="flex items-center gap-2 self-end sm:self-auto">
          <div className="flex items-center gap-1 text-xs text-slate-500">
            <span>Rows per page:</span>
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setPage(1);
              }}
              className="rounded border border-slate-300 bg-white py-0.5 px-1.5 text-xs text-slate-800 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
          </div>

          <span className="text-xs text-slate-500">
            Page {currentPage} of {totalPages}
          </span>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="rounded border border-slate-300 p-1 text-slate-600 disabled:opacity-40 hover:bg-slate-200 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="rounded border border-slate-300 p-1 text-slate-600 disabled:opacity-40 hover:bg-slate-200 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

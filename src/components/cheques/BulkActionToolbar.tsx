import React, { useState } from 'react';
import { CheckCircle2, Trash2, FileSpreadsheet, X } from 'lucide-react';

interface BulkActionToolbarProps {
  selectedCount: number;
  onClearSelection: () => void;
  onBulkMarkCleared: (voucherPrefix: string) => void;
  onBulkDelete: () => void;
  onBulkExport: () => void;
}

export const BulkActionToolbar: React.FC<BulkActionToolbarProps> = ({
  selectedCount,
  onClearSelection,
  onBulkMarkCleared,
  onBulkDelete,
  onBulkExport,
}) => {
  const [showVoucherModal, setShowVoucherModal] = useState(false);
  const [voucherPrefix, setVoucherPrefix] = useState('V-BULK');

  if (selectedCount === 0) return null;

  const handleApplyBulkCleared = (e: React.FormEvent) => {
    e.preventDefault();
    onBulkMarkCleared(voucherPrefix.trim() || 'V-BULK');
    setShowVoucherModal(false);
  };

  return (
    <>
      <div className="flex items-center justify-between rounded-xl bg-slate-900 px-4 py-2.5 text-white shadow-lg animate-in fade-in duration-200">
        <div className="flex items-center gap-3">
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-600 text-xs font-bold">
            {selectedCount}
          </span>
          <span className="text-xs font-bold tracking-wide">Records Selected</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowVoucherModal(true)}
            className="flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white transition hover:bg-emerald-500"
          >
            <CheckCircle2 className="h-3.5 w-3.5" />
            <span>Mark Selected Cleared</span>
          </button>

          <button
            onClick={onBulkExport}
            className="flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs font-semibold text-slate-200 transition hover:bg-slate-700"
          >
            <FileSpreadsheet className="h-3.5 w-3.5 text-blue-400" />
            <span>Export Selected</span>
          </button>

          <button
            onClick={onBulkDelete}
            className="flex items-center gap-1.5 rounded-lg bg-rose-600/80 px-3 py-1.5 text-xs font-bold text-white transition hover:bg-rose-600"
          >
            <Trash2 className="h-3.5 w-3.5" />
            <span>Delete Selected</span>
          </button>

          <button
            onClick={onClearSelection}
            title="Deselect All"
            className="ml-2 rounded-md p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Bulk Mark Cleared Voucher Prefix Dialog */}
      {showVoucherModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Bulk Mark Cleared</h3>
            <p className="mt-1 text-xs text-slate-500">
              Applying voucher numbers to {selectedCount} selected cheques will automatically change their status to <strong>Cleared</strong>.
            </p>

            <form onSubmit={handleApplyBulkCleared} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Voucher Number Prefix:
                </label>
                <input
                  type="text"
                  value={voucherPrefix}
                  onChange={(e) => setVoucherPrefix(e.target.value)}
                  placeholder="e.g. V-JULY-BATCH"
                  required
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 focus:border-blue-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowVoucherModal(false)}
                  className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-emerald-600 px-4 py-1.5 text-xs font-bold text-white hover:bg-emerald-700"
                >
                  Apply & Clear Status
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

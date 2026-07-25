import React, { useState } from 'react';
import {
  X,
  Printer,
  Edit2,
  Copy,
  Trash2,
  CheckCircle2,
  Clock,
  RotateCcw,
  Building2,
  Receipt,
  Building,
  User,
  Calendar,
  FileText,
} from 'lucide-react';
import { Cheque, CompanySettings } from '../../types';
import { storageService } from '../../services/storageService';
import { formatCurrencyPKR, printChequeList } from '../../services/exportService';

interface ChequeDetailModalProps {
  cheque: Cheque | null;
  onClose: () => void;
  onEdit: (cheque: Cheque) => void;
  onDuplicate: (cheque: Cheque) => void;
  onDelete: (id: string) => void;
}

export const ChequeDetailModal: React.FC<ChequeDetailModalProps> = ({
  cheque,
  onClose,
  onEdit,
  onDuplicate,
  onDelete,
}) => {
  if (!cheque) return null;

  const [settings] = useState<CompanySettings>(storageService.getSettings());
  const [voucherInput, setVoucherInput] = useState('');
  const [returnReasonInput, setReturnReasonInput] = useState('Signature mismatch - Returned to customer');
  const [showMarkClearedBox, setShowMarkClearedBox] = useState(false);
  const [showReturnBox, setShowReturnBox] = useState(false);

  const handleMarkClearedSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!voucherInput.trim()) return;
    storageService.updateCheque(cheque.id, {
      voucherNumber: voucherInput.trim(),
      paidDate: new Date().toISOString().split('T')[0],
      paidTo: cheque.paidTo || 'Saleem Daal Main A/C',
      status: 'Cleared',
    });
    setShowMarkClearedBox(false);
  };

  const handleReturnSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    storageService.markAsReturned(cheque.id, returnReasonInput.trim() || 'Returned to Customer');
    setShowReturnBox(false);
  };

  const handlePrintSingle = () => {
    printChequeList([cheque], settings, `Cheque Voucher Receipt #${cheque.chequeNumber}`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
      <div className="relative w-full max-w-xl rounded-2xl bg-white shadow-2xl dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-hidden">
        {/* Header Banner */}
        <div className="bg-slate-900 px-6 py-4 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 font-bold text-white shadow">
              <Receipt className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-base font-bold">Cheque Record Voucher</h2>
              <p className="text-xs text-slate-400">Saleem Daal Factory • Cheque #{cheque.chequeNumber}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Status & Amount Card */}
          <div className="flex items-center justify-between rounded-xl bg-slate-50 p-4 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Cheque Amount
              </span>
              <div className="text-2xl font-black text-slate-900 dark:text-white mt-0.5">
                {formatCurrencyPKR(cheque.amount)}
              </div>
            </div>

            <div>
              <span
                className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold ${
                  cheque.status === 'Cleared'
                    ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300'
                    : cheque.status === 'Returned'
                    ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300'
                    : 'bg-rose-100 text-rose-800 dark:bg-rose-900/50 dark:text-rose-300'
                }`}
              >
                {cheque.status === 'Cleared' ? (
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                ) : cheque.status === 'Returned' ? (
                  <RotateCcw className="h-4 w-4 text-amber-600" />
                ) : (
                  <Clock className="h-4 w-4 text-rose-600" />
                )}
                {cheque.status === 'Returned' ? 'RETURNED TO CUSTOMER' : cheque.status.toUpperCase()}
              </span>
            </div>
          </div>

          {/* Key Grid Details */}
          <div className="grid grid-cols-2 gap-4 text-xs">
            <div className="space-y-1">
              <span className="font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1">
                <User className="h-3.5 w-3.5 text-blue-500" /> Party Name (Receive From)
              </span>
              <p className="font-bold text-slate-800 dark:text-slate-100 text-sm">{cheque.receiveFrom}</p>
            </div>

            <div className="space-y-1">
              <span className="font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1">
                <Building className="h-3.5 w-3.5 text-blue-500" /> City
              </span>
              <p className="font-bold text-slate-800 dark:text-slate-100 text-sm">{cheque.city}</p>
            </div>

            <div className="space-y-1">
              <span className="font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1">
                <Building2 className="h-3.5 w-3.5 text-blue-500" /> Drawee Bank
              </span>
              <p className="font-bold text-slate-800 dark:text-slate-100">{cheque.bank}</p>
            </div>

            <div className="space-y-1">
              <span className="font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1">
                <FileText className="h-3.5 w-3.5 text-blue-500" /> Cheque Number
              </span>
              <p className="font-mono font-bold text-slate-800 dark:text-slate-100">{cheque.chequeNumber}</p>
            </div>

            <div className="space-y-1">
              <span className="font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5 text-blue-500" /> Receive Date
              </span>
              <p className="font-bold text-slate-800 dark:text-slate-100">{cheque.receiveDate}</p>
            </div>

            <div className="space-y-1">
              <span className="font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5 text-blue-500" /> Cheque Date (Maturity)
              </span>
              <p className="font-bold text-slate-800 dark:text-slate-100">{cheque.chequeDate}</p>
            </div>

            <div className="space-y-1">
              <span className="font-semibold text-slate-500 dark:text-slate-400">Received By (Collector)</span>
              <p className="font-semibold text-slate-800 dark:text-slate-100">{cheque.receivedBy}</p>
            </div>

            <div className="space-y-1">
              <span className="font-semibold text-slate-500 dark:text-slate-400">Paid To Party Name / Account</span>
              <p className="font-semibold text-slate-800 dark:text-slate-100">{cheque.paidTo || '-'}</p>
            </div>

            <div className="space-y-1">
              <span className="font-semibold text-slate-500 dark:text-slate-400">Voucher Number</span>
              <p className="font-mono font-bold text-slate-800 dark:text-slate-100">
                {cheque.voucherNumber || 'Not Cleared'}
              </p>
            </div>

            {cheque.status === 'Cleared' && (
              <div className="space-y-1">
                <span className="font-semibold text-slate-500 dark:text-slate-400">Paid / Cleared Date</span>
                <p className="font-semibold text-slate-800 dark:text-slate-100">{cheque.paidDate || '-'}</p>
              </div>
            )}

            {cheque.status === 'Returned' && (
              <>
                <div className="space-y-1">
                  <span className="font-semibold text-amber-600 dark:text-amber-400">Return Date</span>
                  <p className="font-bold text-amber-800 dark:text-amber-300">{cheque.returnDate || '-'}</p>
                </div>

                <div className="space-y-1 col-span-2">
                  <span className="font-semibold text-amber-600 dark:text-amber-400">Reason for Return</span>
                  <p className="font-bold text-amber-900 dark:text-amber-200">{cheque.returnReason || 'Returned to Customer'}</p>
                </div>
              </>
            )}
          </div>

          {/* Remarks */}
          {cheque.remarks && (
            <div className="rounded-lg bg-slate-50 p-3 text-xs dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800">
              <span className="font-bold text-slate-600 dark:text-slate-300">Remarks:</span>
              <p className="text-slate-700 dark:text-slate-300 mt-0.5">{cheque.remarks}</p>
            </div>
          )}

          {/* Quick Action Box for Return / Clear */}
          {cheque.status !== 'Returned' && (
            <div className="space-y-2">
              {/* Mark Cleared Action */}
              {cheque.status === 'Outstanding' && (
                <div className="rounded-xl border border-blue-200 bg-blue-50/60 p-3 dark:border-blue-900/40 dark:bg-blue-950/20">
                  {!showMarkClearedBox ? (
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-blue-900 dark:text-blue-300">
                        Cheque is currently Outstanding. Apply voucher to clear?
                      </span>
                      <button
                        onClick={() => {
                          setShowMarkClearedBox(true);
                          setShowReturnBox(false);
                        }}
                        className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-emerald-700"
                      >
                        Mark Cleared
                      </button>
                    </div>
                  ) : (
                    <form onSubmit={handleMarkClearedSubmit} className="space-y-2">
                      <label className="block text-xs font-bold text-blue-900 dark:text-blue-300">
                        Enter Voucher Number to Mark Cleared:
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={voucherInput}
                          onChange={(e) => setVoucherInput(e.target.value)}
                          placeholder="e.g. V-2026-0901"
                          required
                          autoFocus
                          className="flex-1 rounded-md border border-blue-300 bg-white px-3 py-1 text-xs text-slate-800 focus:outline-none dark:border-blue-700 dark:bg-slate-800 dark:text-white"
                        />
                        <button
                          type="submit"
                          className="rounded-md bg-emerald-600 px-3 py-1 text-xs font-bold text-white hover:bg-emerald-700"
                        >
                          Confirm
                        </button>
                        <button
                          type="button"
                          onClick={() => setShowMarkClearedBox(false)}
                          className="rounded-md border border-slate-300 px-2 py-1 text-xs text-slate-600 hover:bg-slate-100"
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              )}

              {/* Return to Customer Action */}
              <div className="rounded-xl border border-amber-200 bg-amber-50/60 p-3 dark:border-amber-900/40 dark:bg-amber-950/20">
                {!showReturnBox ? (
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-amber-900 dark:text-amber-300">
                      Need to return this cheque back to party / customer?
                    </span>
                    <button
                      onClick={() => {
                        setShowReturnBox(true);
                        setShowMarkClearedBox(false);
                      }}
                      className="rounded-lg bg-amber-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-amber-700 flex items-center gap-1"
                    >
                      <RotateCcw className="h-3.5 w-3.5" />
                      <span>Return to Customer</span>
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleReturnSubmit} className="space-y-2">
                    <label className="block text-xs font-bold text-amber-900 dark:text-amber-300">
                      Reason for Returning Cheque to {cheque.receiveFrom}:
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={returnReasonInput}
                        onChange={(e) => setReturnReasonInput(e.target.value)}
                        placeholder="e.g. Signature mismatch / Payment settled in cash"
                        required
                        autoFocus
                        className="flex-1 rounded-md border border-amber-300 bg-white px-3 py-1 text-xs text-slate-800 focus:outline-none dark:border-amber-700 dark:bg-slate-800 dark:text-white"
                      />
                      <button
                        type="submit"
                        className="rounded-md bg-amber-600 px-3 py-1 text-xs font-bold text-white hover:bg-amber-700"
                      >
                        Confirm Return
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowReturnBox(false)}
                        className="rounded-md border border-slate-300 px-2 py-1 text-xs text-slate-600 hover:bg-slate-100"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          )}

          {/* Toolbar Actions */}
          <div className="flex items-center justify-between pt-3 border-t border-slate-200 dark:border-slate-800">
            <div className="flex gap-1.5">
              <button
                onClick={() => {
                  onClose();
                  onEdit(cheque);
                }}
                className="flex items-center gap-1 rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
              >
                <Edit2 className="h-3.5 w-3.5" />
                <span>Edit</span>
              </button>

              <button
                onClick={() => {
                  onClose();
                  onDuplicate(cheque);
                }}
                className="flex items-center gap-1 rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
              >
                <Copy className="h-3.5 w-3.5" />
                <span>Duplicate</span>
              </button>

              <button
                onClick={handlePrintSingle}
                className="flex items-center gap-1 rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
              >
                <Printer className="h-3.5 w-3.5" />
                <span>Print</span>
              </button>
            </div>

            <button
              onClick={() => {
                if (confirm(`Are you sure you want to delete Cheque #${cheque.chequeNumber}?`)) {
                  onDelete(cheque.id);
                  onClose();
                }
              }}
              className="flex items-center gap-1 rounded-lg bg-rose-50 border border-rose-200 px-3 py-1.5 text-xs font-semibold text-rose-600 hover:bg-rose-100 dark:bg-rose-950/40 dark:border-rose-900 dark:text-rose-400"
            >
              <Trash2 className="h-3.5 w-3.5" />
              <span>Delete</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

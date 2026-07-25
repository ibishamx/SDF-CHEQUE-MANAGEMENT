import React, { useState, useEffect } from 'react';
import { X, CheckCircle2, AlertTriangle, FileSpreadsheet, Sparkles } from 'lucide-react';
import { Cheque, Party, Bank, City, Employee, ChequeStatus } from '../../types';
import { storageService, computeChequeStatus } from '../../services/storageService';
import { formatCurrencyPKR } from '../../services/exportService';

interface ChequeFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData?: Partial<Cheque>;
  isDuplicateMode?: boolean;
}

export const ChequeFormModal: React.FC<ChequeFormModalProps> = ({
  isOpen,
  onClose,
  initialData,
  isDuplicateMode = false,
}) => {
  if (!isOpen) return null;

  const [parties, setParties] = useState<Party[]>(storageService.getParties());
  const [banks, setBanks] = useState<Bank[]>(storageService.getBanks());
  const [cities, setCities] = useState<City[]>(storageService.getCities());
  const [employees, setEmployees] = useState<Employee[]>(storageService.getEmployees());

  const isEdit = Boolean(initialData?.id) && !isDuplicateMode;

  const todayStr = new Date().toISOString().split('T')[0];

  const [formData, setFormData] = useState({
    receiveDate: initialData?.receiveDate || todayStr,
    receiveFrom: initialData?.receiveFrom || '',
    city: initialData?.city || 'Faisalabad',
    bank: initialData?.bank || (banks[0]?.name || 'Meezan Bank'),
    chequeNumber: isDuplicateMode ? `${initialData?.chequeNumber || ''}-COPY` : initialData?.chequeNumber || '',
    chequeDate: initialData?.chequeDate || todayStr,
    amount: initialData?.amount ? String(initialData.amount) : '',
    receivedBy: initialData?.receivedBy || (employees[0]?.name || 'Muhammad Tariq'),
    status: (initialData?.status as ChequeStatus) || (initialData?.voucherNumber ? 'Cleared' : initialData?.returnDate ? 'Returned' : 'Outstanding'),
    voucherNumber: isDuplicateMode ? '' : initialData?.voucherNumber || '',
    paidDate: isDuplicateMode ? '' : initialData?.paidDate || '',
    paidTo: isDuplicateMode ? '' : initialData?.paidTo || '',
    returnDate: isDuplicateMode ? '' : initialData?.returnDate || '',
    returnReason: isDuplicateMode ? '' : initialData?.returnReason || '',
    remarks: initialData?.remarks || '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Computed status preview
  const previewStatus: ChequeStatus =
    formData.status === 'Returned' || formData.returnDate.trim().length > 0
      ? 'Returned'
      : formData.voucherNumber.trim().length > 0 || formData.status === 'Cleared'
      ? 'Cleared'
      : 'Outstanding';

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.receiveFrom.trim()) {
      newErrors.receiveFrom = 'Party Name (Receive From) is required.';
    }
    if (!formData.chequeNumber.trim()) {
      newErrors.chequeNumber = 'Cheque Number is required.';
    } else {
      // Check duplicate cheque number
      const existing = storageService.getCheques();
      const duplicate = existing.find(
        (c) =>
          c.chequeNumber.toLowerCase().trim() === formData.chequeNumber.toLowerCase().trim() &&
          (isEdit ? c.id !== initialData?.id : true)
      );
      if (duplicate) {
        newErrors.chequeNumber = `Cheque #${formData.chequeNumber} already exists in database for ${duplicate.receiveFrom}.`;
      }
    }

    if (!formData.bank.trim()) {
      newErrors.bank = 'Bank Name is required.';
    }

    const numAmount = parseFloat(formData.amount);
    if (!formData.amount || isNaN(numAmount) || numAmount <= 0) {
      newErrors.amount = 'Amount must be a valid positive number.';
    }

    if (formData.status === 'Cleared') {
      if (!formData.voucherNumber.trim()) {
        newErrors.voucherNumber = 'Voucher Number is compulsory when marking as Cleared.';
      }
      if (!formData.paidTo.trim()) {
        newErrors.paidTo = 'Paid To Party Name / Account is compulsory when Cleared.';
      }
    }

    if (formData.status === 'Returned') {
      if (!formData.returnReason.trim()) {
        newErrors.returnReason = 'Reason for Return is compulsory when returning cheque to customer.';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const payload = {
      receiveDate: formData.receiveDate,
      receiveFrom: formData.receiveFrom.trim(),
      city: formData.city.trim(),
      bank: formData.bank.trim(),
      chequeNumber: formData.chequeNumber.trim(),
      chequeDate: formData.chequeDate,
      amount: parseFloat(formData.amount),
      receivedBy: formData.receivedBy.trim(),
      voucherNumber: formData.voucherNumber.trim(),
      paidDate: formData.paidDate.trim(),
      paidTo: formData.paidTo.trim(),
      returnDate: formData.status === 'Returned' ? (formData.returnDate || todayStr) : '',
      returnReason: formData.status === 'Returned' ? (formData.returnReason || 'Returned to Customer') : '',
      status: previewStatus,
      remarks: formData.remarks.trim(),
    };

    if (isEdit && initialData?.id) {
      storageService.updateCheque(initialData.id, payload);
    } else {
      storageService.addCheque(payload);
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl bg-white shadow-2xl dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-slate-900 px-6 py-4 text-white">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white font-bold">
              <FileSpreadsheet className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold">
                {isEdit ? 'Edit Cheque Record' : isDuplicateMode ? 'Duplicate Cheque Entry' : 'Record New Incoming Cheque'}
              </h2>
              <p className="text-xs text-slate-300">Saleem Daal Factory Cheque Register</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Automatic / Manual Status Badge Banner */}
          <div
            className={`flex items-center justify-between rounded-xl p-3 border text-xs font-semibold ${
              previewStatus === 'Cleared'
                ? 'bg-emerald-50 border-emerald-200 text-emerald-800 dark:bg-emerald-950/40 dark:border-emerald-900 dark:text-emerald-300'
                : previewStatus === 'Returned'
                ? 'bg-amber-50 border-amber-200 text-amber-800 dark:bg-amber-950/40 dark:border-amber-900 dark:text-amber-300'
                : 'bg-rose-50 border-rose-200 text-rose-800 dark:bg-rose-950/40 dark:border-rose-900 dark:text-rose-300'
            }`}
          >
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4" />
              <span>
                Record Status: <strong>{previewStatus === 'Returned' ? 'RETURNED TO CUSTOMER' : previewStatus.toUpperCase()}</strong>
              </span>
            </div>
            <div className="text-[11px] opacity-80">
              {previewStatus === 'Cleared'
                ? 'Voucher number attached'
                : previewStatus === 'Returned'
                ? 'Cheque returned to customer'
                : 'Pending clearance (Outstanding)'}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {/* Receive Date */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Receive Date <span className="text-rose-500">*</span>
              </label>
              <input
                type="date"
                value={formData.receiveDate}
                onChange={(e) => handleInputChange('receiveDate', e.target.value)}
                required
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
              />
            </div>

            {/* Cheque Date */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Cheque Date (Maturity) <span className="text-rose-500">*</span>
              </label>
              <input
                type="date"
                value={formData.chequeDate}
                onChange={(e) => handleInputChange('chequeDate', e.target.value)}
                required
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
              />
            </div>

            {/* Receive From (Party) */}
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Party Name (Receive From) <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                list="party-list"
                value={formData.receiveFrom}
                onChange={(e) => handleInputChange('receiveFrom', e.target.value)}
                placeholder="Type or select Party / Grain Merchant..."
                required
                className={`w-full rounded-lg border px-3 py-2 text-sm text-slate-800 focus:ring-1 dark:bg-slate-800 dark:text-slate-100 ${
                  errors.receiveFrom
                    ? 'border-rose-500 focus:border-rose-500 focus:ring-rose-500'
                    : 'border-slate-300 focus:border-blue-500 focus:ring-blue-500 dark:border-slate-700'
                }`}
              />
              <datalist id="party-list">
                {parties.map((p) => (
                  <option key={p.id} value={p.name} />
                ))}
              </datalist>
              {errors.receiveFrom && (
                <p className="mt-1 text-xs text-rose-500 font-medium">{errors.receiveFrom}</p>
              )}
            </div>

            {/* Bank Name */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Drawee Bank <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                list="bank-list"
                value={formData.bank}
                onChange={(e) => handleInputChange('bank', e.target.value)}
                placeholder="Select or type Bank..."
                required
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
              />
              <datalist id="bank-list">
                {banks.map((b) => (
                  <option key={b.id} value={b.name} />
                ))}
              </datalist>
            </div>

            {/* City */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                City <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                list="city-list"
                value={formData.city}
                onChange={(e) => handleInputChange('city', e.target.value)}
                placeholder="City..."
                required
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
              />
              <datalist id="city-list">
                {cities.map((c) => (
                  <option key={c.id} value={c.name} />
                ))}
              </datalist>
            </div>

            {/* Cheque Number */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Cheque Number <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={formData.chequeNumber}
                onChange={(e) => handleInputChange('chequeNumber', e.target.value)}
                placeholder="e.g. MZB-882910"
                required
                className={`w-full rounded-lg border px-3 py-2 text-sm text-slate-800 focus:ring-1 dark:bg-slate-800 dark:text-slate-100 ${
                  errors.chequeNumber
                    ? 'border-rose-500 focus:border-rose-500 focus:ring-rose-500'
                    : 'border-slate-300 focus:border-blue-500 focus:ring-blue-500 dark:border-slate-700'
                }`}
              />
              {errors.chequeNumber && (
                <p className="mt-1 text-xs text-rose-500 font-medium">{errors.chequeNumber}</p>
              )}
            </div>

            {/* Amount (PKR) */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Amount (PKR) <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                value={formData.amount}
                onChange={(e) => handleInputChange('amount', e.target.value)}
                placeholder="e.g. 1500000"
                min="1"
                required
                className={`w-full rounded-lg border px-3 py-2 text-sm font-semibold text-slate-800 focus:ring-1 dark:bg-slate-800 dark:text-slate-100 ${
                  errors.amount
                    ? 'border-rose-500 focus:border-rose-500 focus:ring-rose-500'
                    : 'border-slate-300 focus:border-blue-500 focus:ring-blue-500 dark:border-slate-700'
                }`}
              />
              {formData.amount && !isNaN(Number(formData.amount)) && Number(formData.amount) > 0 && (
                <p className="mt-1 text-[11px] font-semibold text-blue-600 dark:text-blue-400">
                  {formatCurrencyPKR(Number(formData.amount))}
                </p>
              )}
              {errors.amount && <p className="mt-1 text-xs text-rose-500 font-medium">{errors.amount}</p>}
            </div>

            {/* Received By (Employee) */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Received By (Collector) <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                list="emp-list"
                value={formData.receivedBy}
                onChange={(e) => handleInputChange('receivedBy', e.target.value)}
                placeholder="Select Officer / Employee"
                required
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
              />
              <datalist id="emp-list">
                {employees.map((e) => (
                  <option key={e.id} value={e.name} />
                ))}
              </datalist>
            </div>

            {/* Paid To Party Name / Account */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Paid To Party Name / Disbursed Account {formData.status === 'Cleared' && <span className="text-rose-500">* (Required when Cleared)</span>}
              </label>
              <input
                type="text"
                list="paid-to-list"
                value={formData.paidTo}
                onChange={(e) => handleInputChange('paidTo', e.target.value)}
                placeholder="e.g. Saleem Daal Main A/C or Vendor Name"
                className={`w-full rounded-lg border px-3 py-2 text-sm text-slate-800 focus:ring-1 dark:bg-slate-800 dark:text-slate-100 ${
                  errors.paidTo
                    ? 'border-rose-500 focus:border-rose-500 focus:ring-rose-500'
                    : 'border-slate-300 focus:border-blue-500 focus:ring-blue-500 dark:border-slate-700'
                }`}
              />
              {errors.paidTo && <p className="mt-1 text-xs text-rose-500 font-medium">{errors.paidTo}</p>}
              <datalist id="paid-to-list">
                <option value="Saleem Daal Main A/C" />
                <option value="Raw Material Purchase A/C" />
                <option value="Supplier Payment" />
                {parties.map((p) => (
                  <option key={p.id} value={p.name} />
                ))}
              </datalist>
            </div>

            {/* Cheque Status Selection */}
            <div className="sm:col-span-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 p-3.5 border border-slate-200 dark:border-slate-700 space-y-3">
              <label className="block text-xs font-bold text-slate-800 dark:text-slate-200">
                Cheque Processing Status
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => handleInputChange('status', 'Outstanding')}
                  className={`rounded-lg py-2.5 px-3 text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                    formData.status === 'Outstanding' && !formData.returnDate
                      ? 'bg-rose-600 text-white shadow-md ring-2 ring-rose-600/30'
                      : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-300 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-600'
                  }`}
                >
                  <span>Outstanding</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    handleInputChange('status', 'Cleared');
                    if (!formData.paidTo) handleInputChange('paidTo', 'Saleem Daal Main A/C');
                  }}
                  className={`rounded-lg py-2.5 px-3 text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                    formData.status === 'Cleared' || (formData.voucherNumber && formData.status !== 'Returned')
                      ? 'bg-emerald-600 text-white shadow-md ring-2 ring-emerald-600/30'
                      : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-300 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-600'
                  }`}
                >
                  <span>Cleared (Voucher)</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleInputChange('status', 'Returned')}
                  className={`rounded-lg py-2.5 px-3 text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                    formData.status === 'Returned'
                      ? 'bg-amber-600 text-white shadow-md ring-2 ring-amber-600/30'
                      : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-300 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-600'
                  }`}
                >
                  <span>Returned to Customer</span>
                </button>
              </div>

              {/* Cleared details */}
              {(formData.status === 'Cleared' || formData.voucherNumber) && formData.status !== 'Returned' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3 border-t border-slate-200 dark:border-slate-700">
                  <div>
                    <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">
                      Voucher Number <span className="text-rose-500">* (Compulsory)</span>
                    </label>
                    <input
                      type="text"
                      value={formData.voucherNumber}
                      onChange={(e) => handleInputChange('voucherNumber', e.target.value)}
                      placeholder="e.g. V-2026-0901"
                      className={`w-full rounded-lg border px-3 py-1.5 text-xs text-slate-800 focus:ring-1 dark:bg-slate-800 dark:text-slate-100 ${
                        errors.voucherNumber
                          ? 'border-rose-500 focus:border-rose-500'
                          : 'border-slate-300 focus:border-blue-500 dark:border-slate-700'
                      }`}
                    />
                    {errors.voucherNumber && <p className="mt-1 text-xs text-rose-500 font-medium">{errors.voucherNumber}</p>}
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">
                      Paid / Cleared Date
                    </label>
                    <input
                      type="date"
                      value={formData.paidDate || todayStr}
                      onChange={(e) => handleInputChange('paidDate', e.target.value)}
                      className="w-full rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs text-slate-800 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                    />
                  </div>
                </div>
              )}

              {/* Returned to Customer details */}
              {formData.status === 'Returned' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3 border-t border-slate-200 dark:border-slate-700">
                  <div>
                    <label className="block text-xs font-bold text-amber-900 dark:text-amber-300 mb-1">
                      Return Date <span className="text-amber-600">* (Compulsory)</span>
                    </label>
                    <input
                      type="date"
                      value={formData.returnDate || todayStr}
                      onChange={(e) => handleInputChange('returnDate', e.target.value)}
                      required
                      className="w-full rounded-lg border border-amber-300 bg-white px-3 py-1.5 text-xs text-slate-800 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 dark:border-amber-700 dark:bg-slate-800 dark:text-slate-100"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-amber-900 dark:text-amber-300 mb-1">
                      Reason for Return <span className="text-amber-600">* (Compulsory)</span>
                    </label>
                    <input
                      type="text"
                      value={formData.returnReason}
                      onChange={(e) => handleInputChange('returnReason', e.target.value)}
                      placeholder="e.g. Signature mismatch / Returned to Customer"
                      className={`w-full rounded-lg border px-3 py-1.5 text-xs text-slate-800 focus:ring-1 dark:bg-slate-800 dark:text-slate-100 ${
                        errors.returnReason
                          ? 'border-rose-500 focus:border-rose-500'
                          : 'border-amber-300 focus:border-amber-500 dark:border-amber-700'
                      }`}
                    />
                    {errors.returnReason && <p className="mt-1 text-xs text-rose-500 font-medium">{errors.returnReason}</p>}
                  </div>
                </div>
              )}
            </div>

            {/* Remarks */}
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Remarks / Dispatch Reference
              </label>
              <textarea
                value={formData.remarks}
                onChange={(e) => handleInputChange('remarks', e.target.value)}
                rows={2}
                placeholder="e.g. Pulse batch shipment invoice #301..."
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-slate-300 px-4 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2 text-xs font-bold text-white shadow-md transition hover:bg-blue-700 active:scale-[0.98]"
            >
              <Sparkles className="h-4 w-4" />
              <span>{isEdit ? 'Save Changes' : 'Record Cheque'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

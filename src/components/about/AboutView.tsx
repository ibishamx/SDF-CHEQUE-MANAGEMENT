import React from 'react';
import { Building2, ShieldCheck, Cpu, HardDrive, HelpCircle } from 'lucide-react';
import { storageService } from '../../services/storageService';

export const AboutView: React.FC<{ onOpenShortcuts: () => void }> = ({ onOpenShortcuts }) => {
  const settings = storageService.getSettings();

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      {/* Brand Hero Card */}
      <div className="rounded-2xl border border-slate-200 bg-slate-900 p-8 text-white shadow-xl dark:border-slate-800">
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-600 font-bold text-white shadow-lg">
            <Building2 className="h-10 w-10" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold tracking-tight sm:text-2xl">{settings.companyName.toUpperCase()}</h1>
            <p className="text-sm font-semibold text-blue-400">Cheque Management System • v1.0.0</p>
            <p className="mt-1 text-xs text-slate-300">Enterprise Desktop Offline Cheque Tracking Platform</p>
          </div>
        </div>

        <div className="mt-6 border-t border-slate-800 pt-4 flex flex-wrap items-center justify-between text-xs text-slate-400">
          <div>
            Location: <strong className="text-white">{settings.address}</strong>
          </div>
          <div>
            Contact: <strong className="text-white">{settings.phone}</strong>
          </div>
        </div>
      </div>

      {/* Tech Architecture Features */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-2">
          <div className="flex items-center gap-2 text-blue-600 font-bold text-sm">
            <ShieldCheck className="h-5 w-5" />
            <span>100% Offline Local Security</span>
          </div>
          <p className="text-xs text-slate-500 leading-relaxed">
            All cheque records, parties, banks, and transaction histories operate strictly locally on your machine. Zero internet requirement.
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-2">
          <div className="flex items-center gap-2 text-emerald-600 font-bold text-sm">
            <Cpu className="h-5 w-5" />
            <span>High Performance Data Engine</span>
          </div>
          <p className="text-xs text-slate-500 leading-relaxed">
            Optimized for 100,000+ cheque records with instant global search, multi-column sorting, Excel import/export, and PDF generation.
          </p>
        </div>
      </div>

      {/* Keyboard Shortcuts Trigger Button */}
      <div className="rounded-xl border border-blue-200 bg-blue-50/60 p-5 shadow-sm dark:border-blue-900/40 dark:bg-blue-950/20 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <HelpCircle className="h-6 w-6 text-blue-600" />
          <div>
            <h4 className="text-sm font-bold text-slate-900 dark:text-white">Keyboard Shortcuts Available</h4>
            <p className="text-xs text-slate-500">Accelerate office data entry with quick hotkeys (Ctrl+N, Ctrl+F, Ctrl+B, etc.)</p>
          </div>
        </div>

        <button
          onClick={onOpenShortcuts}
          className="rounded-lg bg-blue-600 px-4 py-2 text-xs font-bold text-white hover:bg-blue-700 shadow"
        >
          View Shortcuts
        </button>
      </div>

      {/* Footer copyright */}
      <div className="text-center text-xs text-slate-400 pt-4 border-t border-slate-200 dark:border-slate-800">
        © {new Date().getFullYear()} Saleem Daal Factory. All Rights Reserved. • Designed for High-Volume Grain Trade Operations.
      </div>
    </div>
  );
};

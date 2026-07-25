import React, { useState } from 'react';
import { Settings, Save, Building2, HardDrive, CheckCircle2, Info, ShieldCheck, Cpu, HelpCircle, Download } from 'lucide-react';
import { storageService } from '../../services/storageService';
import { CompanySettings } from '../../types';

export const SettingsForm: React.FC<{ onOpenShortcuts?: () => void }> = ({ onOpenShortcuts }) => {
  const [settings, setSettings] = useState<CompanySettings>(storageService.getSettings());
  const [saved, setSaved] = useState(false);

  const handleChange = (field: keyof CompanySettings, value: any) => {
    setSettings((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    storageService.updateSettings(settings);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      {/* Header */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 font-bold text-white shadow">
            <Settings className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">System Settings & Company Profile</h2>
            <p className="text-xs text-slate-500">Configure Saleem Daal Factory report branding, paths, and preferences</p>
          </div>
        </div>

        {saved && (
          <div className="flex items-center gap-1.5 rounded-lg bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="h-4 w-4" />
            <span>Settings Saved!</span>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Company Profile Card */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Building2 className="h-4 w-4 text-blue-600" />
            <span>Company Branding & Contact Profile</span>
          </h3>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 text-xs">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Company Name</label>
              <input
                type="text"
                value={settings.companyName}
                onChange={(e) => handleChange('companyName', e.target.value)}
                required
                className="w-full rounded-lg border border-slate-300 bg-white p-2 text-slate-800 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Tagline</label>
              <input
                type="text"
                value={settings.tagline}
                onChange={(e) => handleChange('tagline', e.target.value)}
                className="w-full rounded-lg border border-slate-300 bg-white p-2 text-slate-800 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Address</label>
              <input
                type="text"
                value={settings.address}
                onChange={(e) => handleChange('address', e.target.value)}
                className="w-full rounded-lg border border-slate-300 bg-white p-2 text-slate-800 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Phone Number(s)</label>
              <input
                type="text"
                value={settings.phone}
                onChange={(e) => handleChange('phone', e.target.value)}
                className="w-full rounded-lg border border-slate-300 bg-white p-2 text-slate-800 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Email</label>
              <input
                type="email"
                value={settings.email}
                onChange={(e) => handleChange('email', e.target.value)}
                className="w-full rounded-lg border border-slate-300 bg-white p-2 text-slate-800 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
            </div>
          </div>
        </div>

        {/* Local Storage & Folder Paths */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <HardDrive className="h-4 w-4 text-blue-600" />
            <span>Local Directory Paths & Auto Backup</span>
          </h3>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 text-xs">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Backup Folder Path</label>
              <input
                type="text"
                value={settings.backupFolder}
                onChange={(e) => handleChange('backupFolder', e.target.value)}
                className="w-full rounded-lg border border-slate-300 bg-white p-2 text-slate-800 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Export Folder Path</label>
              <input
                type="text"
                value={settings.exportFolder}
                onChange={(e) => handleChange('exportFolder', e.target.value)}
                className="w-full rounded-lg border border-slate-300 bg-white p-2 text-slate-800 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Auto Backup Schedule</label>
              <select
                value={settings.autoBackupSchedule}
                onChange={(e) => handleChange('autoBackupSchedule', e.target.value as any)}
                className="w-full rounded-lg border border-slate-300 bg-white p-2 text-slate-800 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              >
                <option value="daily">Daily Auto Backup</option>
                <option value="weekly">Weekly Auto Backup</option>
                <option value="monthly">Monthly Auto Backup</option>
                <option value="disabled">Disabled</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Currency Symbol</label>
              <input
                type="text"
                value={settings.currency}
                onChange={(e) => handleChange('currency', e.target.value)}
                className="w-full rounded-lg border border-slate-300 bg-white p-2 text-slate-800 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            className="flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-2.5 text-xs font-bold text-white shadow-md hover:bg-blue-700"
          >
            <Save className="h-4 w-4" />
            <span>Save Preferences</span>
          </button>
        </div>
      </form>

      {/* Embedded About Application & License Section */}
      <div className="pt-6 border-t border-slate-200 dark:border-slate-800 space-y-6">
        <div className="flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-white">
          <Info className="h-5 w-5 text-blue-600" />
          <span>About Application & System Info</span>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-slate-900 p-6 text-white shadow-xl dark:border-slate-800">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-600 font-bold text-white shadow-lg">
              <Building2 className="h-8 w-8" />
            </div>
            <div>
              <h1 className="text-lg font-extrabold tracking-tight sm:text-xl">{settings.companyName.toUpperCase()}</h1>
              <p className="text-xs font-semibold text-blue-400">Cheque Management System • v1.0.0</p>
              <p className="mt-1 text-[11px] text-slate-300">Enterprise Desktop Offline Cheque Tracking Platform</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-2">
            <div className="flex items-center gap-2 text-blue-600 font-bold text-xs">
              <ShieldCheck className="h-4 w-4" />
              <span>100% Offline Local Security</span>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              All cheque records, parties, banks, and transaction histories operate strictly locally on your machine.
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-2">
            <div className="flex items-center gap-2 text-emerald-600 font-bold text-xs">
              <Cpu className="h-4 w-4" />
              <span>High Performance Engine</span>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              Optimized for high-volume cheque records with instant search, sorting, Excel import/export, and voucher printing.
            </p>
          </div>
        </div>

        {/* Desktop Installation Guide Box */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-3">
          <div className="flex items-center gap-2 text-slate-900 dark:text-white font-bold text-xs">
            <Download className="h-4 w-4 text-blue-600" />
            <span>How to Install as Desktop App on Client PC</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs text-slate-600 dark:text-slate-400">
            <div className="rounded-lg bg-slate-50 p-3 border border-slate-100 dark:bg-slate-800/60 dark:border-slate-800 space-y-1.5">
              <span className="font-bold text-blue-600 dark:text-blue-400 block">Method 1: Direct PWA Web Install (Easiest)</span>
              <ol className="list-decimal list-inside space-y-1 text-[11px]">
                <li>Open this app link in Google Chrome, Microsoft Edge, or Brave on client PC.</li>
                <li>Click the <strong>Install App icon</strong> in the browser top address bar (or click <code>... Menu -&gt; Save and Share -&gt; Install app</code>).</li>
                <li>Check <em>"Open as window"</em> and click Install.</li>
                <li>A desktop icon will be created on Windows Desktop &amp; Start Menu for instant offline access!</li>
              </ol>
            </div>

            <div className="rounded-lg bg-slate-50 p-3 border border-slate-100 dark:bg-slate-800/60 dark:border-slate-800 space-y-1.5">
              <span className="font-bold text-blue-600 dark:text-blue-400 block">Method 2: Standalone Local Node Server</span>
              <ol className="list-decimal list-inside space-y-1 text-[11px]">
                <li>Export the source code ZIP from AI Studio Settings Menu.</li>
                <li>Extract ZIP on the client desktop folder.</li>
                <li>Run <code>npm install</code> then <code>npm run build</code>.</li>
                <li>Launch locally with <code>npx serve -s dist -l 3000</code> or run as a background service.</li>
              </ol>
            </div>
          </div>
        </div>

        {onOpenShortcuts && (
          <div className="rounded-xl border border-blue-200 bg-blue-50/60 p-4 shadow-sm dark:border-blue-900/40 dark:bg-blue-950/20 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <HelpCircle className="h-5 w-5 text-blue-600" />
              <div>
                <h4 className="text-xs font-bold text-slate-900 dark:text-white">Keyboard Shortcuts</h4>
                <p className="text-[11px] text-slate-500">Ctrl+N (New), Ctrl+F (Search), Ctrl+B (Backup)</p>
              </div>
            </div>

            <button
              onClick={onOpenShortcuts}
              className="rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-blue-700 shadow"
            >
              Shortcuts
            </button>
          </div>
        )}
      </div>
    </div>
  );
};


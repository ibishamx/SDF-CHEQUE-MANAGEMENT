import React from 'react';
import { X, Keyboard } from 'lucide-react';

interface ShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ShortcutsModal: React.FC<ShortcutsModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const shortcuts = [
    { key: 'Ctrl + N', desc: 'Open New Cheque Form' },
    { key: 'Ctrl + F', desc: 'Focus Global Search' },
    { key: 'Ctrl + B', desc: 'Create Instant Backup' },
    { key: 'Ctrl + E', desc: 'Export Current View to Excel' },
    { key: 'Ctrl + P', desc: 'Print Current Cheque List' },
    { key: 'Ctrl + R', desc: 'Refresh / Go to Dashboard' },
    { key: 'Esc', desc: 'Close Active Modals or Drawers' },
    { key: '?', desc: 'Toggle Keyboard Shortcuts Sheet' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
          <div className="flex items-center gap-2 text-slate-900 dark:text-white font-bold text-sm">
            <Keyboard className="h-5 w-5 text-blue-600" />
            <span>Keyboard Shortcuts</span>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-800 dark:hover:bg-slate-800 dark:hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="divide-y divide-slate-100 text-xs dark:divide-slate-800">
          {shortcuts.map((s) => (
            <div key={s.key} className="py-2.5 flex items-center justify-between">
              <span className="text-slate-600 dark:text-slate-400">{s.desc}</span>
              <kbd className="rounded border border-slate-300 bg-slate-100 px-2 py-1 font-mono font-bold text-slate-800 shadow-xs dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200">
                {s.key}
              </kbd>
            </div>
          ))}
        </div>

        <div className="pt-2 text-right">
          <button
            onClick={onClose}
            className="rounded-lg bg-blue-600 px-4 py-1.5 text-xs font-bold text-white hover:bg-blue-700"
          >
            Got It
          </button>
        </div>
      </div>
    </div>
  );
};

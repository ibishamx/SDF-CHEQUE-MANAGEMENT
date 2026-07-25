import React, { useState } from 'react';
import { Users2, BarChart3, FileUp, HardDriveUpload, Settings } from 'lucide-react';
import { MasterDataManager } from '../masterData/MasterDataManager';
import { ReportsView } from '../reports/ReportsView';
import { ImportWizard } from '../import/ImportWizard';
import { BackupRestoreManager } from '../backup/BackupRestoreManager';
import { SettingsForm } from '../settings/SettingsForm';

interface UtilitiesViewProps {
  onOpenShortcuts?: () => void;
  onImportComplete?: () => void;
}

export const UtilitiesView: React.FC<UtilitiesViewProps> = ({
  onOpenShortcuts,
  onImportComplete,
}) => {
  const [subTab, setSubTab] = useState<'master' | 'reports' | 'import' | 'backup' | 'settings'>('master');

  const subNavItems = [
    { id: 'master', label: 'Master Data (Parties, Banks, Officers)', icon: Users2 },
    { id: 'reports', label: 'Reports & Export', icon: BarChart3 },
    { id: 'import', label: 'Import Excel Data', icon: FileUp },
    { id: 'backup', label: 'Backup & Restore', icon: HardDriveUpload },
    { id: 'settings', label: 'System Settings & About App', icon: Settings },
  ];

  return (
    <div className="space-y-6">
      {/* Utilities Header and Sub-Navigation Pills */}
      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-3">
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-white">Utilities & System Configuration</h2>
          <p className="text-xs text-slate-500">Manage master parties, generate detailed PDF/Excel reports, backup data, or import records.</p>
        </div>

        {/* Sub-nav Buttons */}
        <div className="flex flex-wrap gap-2 border-t border-slate-100 pt-3 dark:border-slate-800">
          {subNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = subTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setSubTab(item.id as any)}
                className={`flex items-center gap-2 rounded-lg px-3.5 py-2 text-xs font-bold transition ${
                  isActive
                    ? 'bg-blue-600 text-white shadow'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Sub-tab Dynamic Content */}
      <div className="pt-2">
        {subTab === 'master' && <MasterDataManager />}
        {subTab === 'reports' && <ReportsView />}
        {subTab === 'import' && <ImportWizard onComplete={onImportComplete} />}
        {subTab === 'backup' && <BackupRestoreManager />}
        {subTab === 'settings' && <SettingsForm onOpenShortcuts={onOpenShortcuts} />}
      </div>
    </div>
  );
};

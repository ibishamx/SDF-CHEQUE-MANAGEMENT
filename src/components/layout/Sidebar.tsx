import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  FileSpreadsheet,
  Wrench,
  ShieldCheck,
  PlusCircle,
  Plus,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { storageService, subscribeStorage } from '../../services/storageService';

interface SidebarProps {
  activeTab: string;
  onSelectTab: (tab: string) => void;
  onOpenNewCheque: () => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onSelectTab,
  onOpenNewCheque,
  isCollapsed = false,
  onToggleCollapse,
}) => {
  const [cheques, setCheques] = useState(storageService.getCheques());

  useEffect(() => {
    const unsubscribe = subscribeStorage(() => {
      setCheques(storageService.getCheques());
    });
    return unsubscribe;
  }, []);

  const activeCheques = cheques.filter((c) => !c.isDeleted);
  const outstandingCount = activeCheques.filter((c) => c.status === 'Outstanding').length;

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    {
      id: 'cheques',
      label: 'Cheque Management',
      icon: FileSpreadsheet,
      badge: activeCheques.length,
      subInfo: outstandingCount > 0 ? `${outstandingCount} Pending` : 'All Clear',
    },
    { id: 'utilities', label: 'Utilities & Settings', icon: Wrench },
  ];

  return (
    <aside
      className={`flex flex-col border-r border-slate-200 bg-white text-slate-700 transition-all duration-300 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 ${
        isCollapsed ? 'w-16 items-center' : 'w-64'
      }`}
    >
      {/* Quick Add Button & Collapse Button */}
      <div className={`p-3 ${isCollapsed ? 'flex flex-col items-center gap-2' : ''}`}>
        {!isCollapsed ? (
          <div className="flex items-center gap-2">
            <button
              onClick={onOpenNewCheque}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-blue-600 py-3 px-4 font-bold text-white shadow-md transition hover:bg-blue-700 active:scale-[0.98]"
            >
              <PlusCircle className="h-5 w-5" />
              <span>New Cheque Record</span>
            </button>
            {onToggleCollapse && (
              <button
                onClick={onToggleCollapse}
                title="Collapse Sidebar"
                className="rounded-xl border border-slate-200 p-3 text-slate-500 hover:bg-slate-100 dark:border-slate-800 dark:hover:bg-slate-800 dark:text-slate-400"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2 pt-1">
            <button
              onClick={onOpenNewCheque}
              title="New Cheque Record (Ctrl+N)"
              className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-600 font-bold text-white shadow-md hover:bg-blue-700 active:scale-95 transition"
            >
              <Plus className="h-6 w-6" />
            </button>
            {onToggleCollapse && (
              <button
                onClick={onToggleCollapse}
                title="Expand Sidebar"
                className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-white"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            )}
          </div>
        )}
      </div>

      {/* Simplified Nav Menu */}
      <nav className="flex-1 space-y-2 px-2 py-2 w-full">
        {!isCollapsed && (
          <p className="px-3 pb-1 text-[11px] font-bold uppercase tracking-wider text-slate-400">Main Menu</p>
        )}
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            activeTab === item.id ||
            (item.id === 'cheques' && ['outstanding', 'cleared', 'returned'].includes(activeTab)) ||
            (item.id === 'utilities' && ['master', 'reports', 'import', 'export', 'backup', 'settings', 'about'].includes(activeTab));

          if (isCollapsed) {
            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                title={item.label}
                className={`relative flex h-11 w-full items-center justify-center rounded-xl transition ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white'
                }`}
              >
                <Icon className="h-5 w-5" />
                {item.badge !== undefined && (
                  <span className="absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-extrabold text-white">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          }

          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              className={`flex w-full items-center justify-between rounded-xl px-3.5 py-3 text-sm font-bold transition ${
                isActive
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`h-5 w-5 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </div>
              {item.badge !== undefined && (
                <div className="flex flex-col items-end">
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-extrabold ${
                      isActive ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-300'
                    }`}
                  >
                    {item.badge}
                  </span>
                </div>
              )}
            </button>
          );
        })}
      </nav>

      {/* Offline Status Footer */}
      <div className={`border-t border-slate-200 text-xs dark:border-slate-800 ${isCollapsed ? 'p-2 text-center' : 'p-3'}`}>
        {!isCollapsed ? (
          <>
            <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold">
              <ShieldCheck className="h-4 w-4" />
              <span>Offline System Active</span>
            </div>
            <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400 font-medium">
              Saleem Daal Factory System
            </p>
          </>
        ) : (
          <div className="flex justify-center" title="Offline System Active - Saleem Daal Factory">
            <ShieldCheck className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
          </div>
        )}
      </div>
    </aside>
  );
};



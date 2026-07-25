import React, { useState, useEffect } from 'react';
import {
  Search,
  Clock,
  Calendar,
  Database,
  Bell,
  HelpCircle,
  Sun,
  Moon,
  Building2,
  PanelLeftClose,
  PanelLeftOpen,
} from 'lucide-react';
import { storageService, subscribeStorage } from '../../services/storageService';
import { CompanySettings, AuditLog } from '../../types';

interface HeaderProps {
  onOpenShortcuts: () => void;
  onOpenNotifications: () => void;
  onQuickBackup: () => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  currentTheme: 'light' | 'dark';
  onToggleTheme: () => void;
  activeTab: string;
  isSidebarOpen: boolean;
  onToggleSidebar: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenShortcuts,
  onOpenNotifications,
  onQuickBackup,
  searchQuery,
  onSearchChange,
  currentTheme,
  onToggleTheme,
  activeTab,
  isSidebarOpen,
  onToggleSidebar,
}) => {
  const [settings, setSettings] = useState<CompanySettings>(storageService.getSettings());
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(storageService.getAuditLogs());
  const [time, setTime] = useState<string>('');
  const [date, setDate] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTime(
        now.toLocaleTimeString('en-PK', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: true,
        })
      );
      setDate(
        now.toLocaleDateString('en-PK', {
          weekday: 'short',
          year: 'numeric',
          month: 'short',
          day: 'numeric',
        })
      );
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);

    const unsubscribe = subscribeStorage(() => {
      setSettings(storageService.getSettings());
      setAuditLogs(storageService.getAuditLogs());
    });

    return () => {
      clearInterval(interval);
      unsubscribe();
    };
  }, []);

  const unreadCount = auditLogs.slice(0, 10).length;

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-slate-200 bg-slate-900 px-4 text-white shadow-md dark:border-slate-800">
      {/* Brand & App Name */}
      <div className="flex items-center gap-2.5 sm:gap-3">
        <button
          onClick={onToggleSidebar}
          title={isSidebarOpen ? 'Hide/Collapse Sidebar' : 'Show/Expand Sidebar'}
          className="rounded-lg p-2 text-slate-300 hover:bg-slate-800 hover:text-white transition active:scale-95 flex items-center justify-center border border-slate-700/60"
        >
          {isSidebarOpen ? (
            <PanelLeftClose className="h-5 w-5 text-blue-400" />
          ) : (
            <PanelLeftOpen className="h-5 w-5 text-blue-400" />
          )}
        </button>

        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600 font-bold text-white shadow-md">
          {settings.logoUrl ? (
            <img src={settings.logoUrl} alt="Logo" className="h-8 w-8 object-contain" />
          ) : (
            <Building2 className="h-6 w-6 text-white" />
          )}
        </div>
        <div className="hidden min-[400px]:block">
          <h1 className="text-base font-bold tracking-tight text-white sm:text-lg leading-tight">
            {settings.companyName.toUpperCase()}
          </h1>
          <p className="text-xs font-medium text-slate-300">Cheque Management System</p>
        </div>
      </div>

      {/* Center Search Input */}
      <div className="hidden max-w-md flex-1 px-6 sm:block">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search cheque #, party, bank, city, voucher..."
            className="w-full rounded-md border border-slate-700 bg-slate-800/80 py-1.5 pl-9 pr-4 text-sm text-white placeholder-slate-400 transition focus:border-blue-500 focus:bg-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 hover:text-white"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Live Clock & Date */}
        <div className="hidden text-right lg:block">
          <div className="flex items-center justify-end gap-1 text-xs font-semibold text-slate-200">
            <Clock className="h-3.5 w-3.5 text-blue-400" />
            <span>{time}</span>
          </div>
          <div className="flex items-center justify-end gap-1 text-[11px] text-slate-400">
            <Calendar className="h-3 w-3 text-slate-400" />
            <span>{date}</span>
          </div>
        </div>

        {/* Quick Backup */}
        <button
          onClick={onQuickBackup}
          title="Create Instant Backup (Ctrl+B)"
          className="flex items-center gap-1.5 rounded-md border border-slate-700 bg-slate-800 px-2.5 py-1.5 text-xs font-medium text-slate-200 transition hover:border-blue-500 hover:bg-slate-700 hover:text-white"
        >
          <Database className="h-3.5 w-3.5 text-blue-400" />
          <span className="hidden md:inline">Backup</span>
        </button>

        {/* Notifications */}
        <button
          onClick={onOpenNotifications}
          title="System Logs & Notifications"
          className="relative rounded-md border border-slate-700 bg-slate-800 p-2 text-slate-300 transition hover:bg-slate-700 hover:text-white"
        >
          <Bell className="h-4 w-4" />
          {unreadCount > 0 && (
            <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-blue-600 text-[10px] font-bold text-white">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>

        {/* Keyboard Shortcuts */}
        <button
          onClick={onOpenShortcuts}
          title="Keyboard Shortcuts (?)"
          className="rounded-md border border-slate-700 bg-slate-800 p-2 text-slate-300 transition hover:bg-slate-700 hover:text-white"
        >
          <HelpCircle className="h-4 w-4" />
        </button>

        {/* Theme Toggle */}
        <button
          onClick={onToggleTheme}
          title={`Switch to ${currentTheme === 'light' ? 'Dark' : 'Light'} Mode`}
          className="rounded-md border border-slate-700 bg-slate-800 p-2 text-slate-300 transition hover:bg-slate-700 hover:text-white"
        >
          {currentTheme === 'light' ? (
            <Moon className="h-4 w-4 text-amber-300" />
          ) : (
            <Sun className="h-4 w-4 text-amber-400" />
          )}
        </button>
      </div>
    </header>
  );
};

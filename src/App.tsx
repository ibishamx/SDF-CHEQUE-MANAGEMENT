import React, { useState, useEffect, useCallback } from 'react';
import { Header } from './components/layout/Header';
import { Sidebar } from './components/layout/Sidebar';
import { DashboardKPIs } from './components/dashboard/DashboardKPIs';
import { DashboardCharts } from './components/dashboard/DashboardCharts';
import { ChequeTable } from './components/cheques/ChequeTable';
import { ChequeStatsSummary } from './components/cheques/ChequeStatsSummary';
import { QuickFilterBar } from './components/cheques/QuickFilterBar';
import { BulkActionToolbar } from './components/cheques/BulkActionToolbar';
import { ChequeFormModal } from './components/cheques/ChequeFormModal';
import { ChequeDetailModal } from './components/cheques/ChequeDetailModal';
import { UtilitiesView } from './components/utilities/UtilitiesView';
import { ShortcutsModal } from './components/common/ShortcutsModal';
import { NotificationsDrawer } from './components/common/NotificationsDrawer';

import { storageService, subscribeStorage } from './services/storageService';
import { exportToExcel, printChequeList } from './services/exportService';
import { Cheque, FilterState, CompanySettings, AuditLog } from './types';
import { Plus, FileSpreadsheet, Printer, RefreshCw } from 'lucide-react';

export default function App() {
  const [cheques, setCheques] = useState<Cheque[]>(storageService.getCheques());
  const [settings, setSettings] = useState<CompanySettings>(storageService.getSettings());
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(storageService.getAuditLogs());

  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(true);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(false);

  // Tab Selection Handler
  const handleSelectTab = (tab: string) => {
    if (['outstanding', 'cleared', 'returned'].includes(tab)) {
      setActiveTab('cheques');
      setFilter((prev) => ({
        ...prev,
        status: tab === 'outstanding' ? 'Outstanding' : tab === 'cleared' ? 'Cleared' : 'Returned',
      }));
    } else if (['master', 'reports', 'import', 'export', 'backup', 'settings', 'about'].includes(tab)) {
      setActiveTab('utilities');
    } else {
      setActiveTab(tab);
    }
  };

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<FilterState>({
    searchQuery: '',
    status: 'ALL',
  });

  // Table Selection
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Modals & Drawers state
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingCheque, setEditingCheque] = useState<Partial<Cheque> | null>(null);
  const [isDuplicateMode, setIsDuplicateMode] = useState(false);

  const [viewingCheque, setViewingCheque] = useState<Cheque | null>(null);
  const [isShortcutsOpen, setIsShortcutsOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  useEffect(() => {
    const unsubscribe = subscribeStorage(() => {
      setCheques(storageService.getCheques());
      setSettings(storageService.getSettings());
      setAuditLogs(storageService.getAuditLogs());
    });
    return unsubscribe;
  }, []);

  // Sync dark theme class on body
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  // Global Keyboard Shortcuts
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key.toLowerCase() === 'n') {
        e.preventDefault();
        setEditingCheque(null);
        setIsDuplicateMode(false);
        setIsFormModalOpen(true);
      } else if (e.ctrlKey && e.key.toLowerCase() === 'b') {
        e.preventDefault();
        storageService.createBackup('manual');
        showToast('Instant Database Backup Created Successfully!');
      } else if (e.key === '?') {
        e.preventDefault();
        setIsShortcutsOpen((prev) => !prev);
      } else if (e.key === 'Escape') {
        setIsFormModalOpen(false);
        setViewingCheque(null);
        setIsShortcutsOpen(false);
        setIsNotificationsOpen(false);
      }
    },
    []
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  // Combined Search and Filter logic for Cheque Grid
  const activeCheques = cheques.filter((c) => !c.isDeleted);

  const filteredCheques = activeCheques.filter((c) => {
    // Tab filter override
    if (activeTab === 'outstanding' && c.status !== 'Outstanding') return false;
    if (activeTab === 'cleared' && c.status !== 'Cleared') return false;
    if (activeTab === 'returned' && c.status !== 'Returned') return false;

    // Quick filter bar status
    if (filter.status === 'Outstanding' && c.status !== 'Outstanding') return false;
    if (filter.status === 'Cleared' && c.status !== 'Cleared') return false;
    if (filter.status === 'Returned' && c.status !== 'Returned') return false;

    // City / Bank / Employee dropdown filters
    if (filter.city && c.city.toLowerCase() !== filter.city.toLowerCase()) return false;
    if (filter.bank && !c.bank.toLowerCase().includes(filter.bank.toLowerCase())) return false;
    if (filter.employee && c.receivedBy.toLowerCase() !== filter.employee.toLowerCase()) return false;

    // Dates
    if (filter.startDate && c.receiveDate < filter.startDate) return false;
    if (filter.endDate && c.receiveDate > filter.endDate) return false;

    // Search query match
    const q = searchQuery.toLowerCase().trim();
    if (q) {
      const matchNum = c.chequeNumber.toLowerCase().includes(q);
      const matchParty = c.receiveFrom.toLowerCase().includes(q);
      const matchBank = c.bank.toLowerCase().includes(q);
      const matchCity = c.city.toLowerCase().includes(q);
      const matchEmp = c.receivedBy.toLowerCase().includes(q);
      const matchVoucher = (c.voucherNumber || '').toLowerCase().includes(q);
      const matchAmt = String(c.amount).includes(q);
      const matchRemarks = (c.remarks || '').toLowerCase().includes(q);
      return (
        matchNum ||
        matchParty ||
        matchBank ||
        matchCity ||
        matchEmp ||
        matchVoucher ||
        matchAmt ||
        matchRemarks
      );
    }

    return true;
  });

  // Selection handlers
  const handleToggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleToggleSelectAll = (allIds: string[]) => {
    if (allIds.every((id) => selectedIds.includes(id))) {
      setSelectedIds((prev) => prev.filter((id) => !allIds.includes(id)));
    } else {
      setSelectedIds((prev) => Array.from(new Set([...prev, ...allIds])));
    }
  };

  // Bulk actions
  const handleBulkMarkCleared = (prefix: string) => {
    storageService.bulkMarkCleared(selectedIds, prefix);
    showToast(`Marked ${selectedIds.length} cheques as Cleared!`);
    setSelectedIds([]);
  };

  const handleBulkDelete = () => {
    if (confirm(`Are you sure you want to soft-delete ${selectedIds.length} selected cheques?`)) {
      storageService.bulkDelete(selectedIds);
      showToast(`Deleted ${selectedIds.length} cheques.`);
      setSelectedIds([]);
    }
  };

  const handleBulkExport = () => {
    const selectedList = activeCheques.filter((c) => selectedIds.includes(c.id));
    exportToExcel(selectedList, settings, 'Selected Cheques Export');
    showToast(`Exported ${selectedList.length} records to Excel.`);
  };

  return (
    <div className="flex h-screen w-screen flex-col overflow-hidden bg-slate-100 text-slate-800 antialiased dark:bg-slate-950 dark:text-slate-100 font-sans">
      {/* Toast Notification Banner */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-3 text-xs font-bold text-white shadow-2xl border border-slate-700 animate-in slide-in-from-bottom duration-200">
          <RefreshCw className="h-4 w-4 text-blue-400 animate-spin" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Navigation Header */}
      <Header
        onOpenShortcuts={() => setIsShortcutsOpen(true)}
        onOpenNotifications={() => setIsNotificationsOpen(true)}
        onQuickBackup={() => {
          storageService.createBackup('manual');
          showToast('Quick Backup Snapshot Saved!');
        }}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        currentTheme={theme}
        onToggleTheme={() => setTheme((t) => (t === 'light' ? 'dark' : 'light'))}
        activeTab={activeTab}
        isSidebarOpen={isSidebarOpen}
        onToggleSidebar={() => setIsSidebarOpen((prev) => !prev)}
      />

      {/* Main Content Workspace */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar Navigation */}
        {isSidebarOpen && (
          <Sidebar
            activeTab={activeTab}
            onSelectTab={handleSelectTab}
            isCollapsed={isSidebarCollapsed}
            onToggleCollapse={() => setIsSidebarCollapsed((prev) => !prev)}
            onOpenNewCheque={() => {
              setEditingCheque(null);
              setIsDuplicateMode(false);
              setIsFormModalOpen(true);
            }}
          />
        )}

        {/* Dynamic View Panel */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6">
          {/* DASHBOARD TAB */}
          {activeTab === 'dashboard' && (
            <div className="space-y-6">
              <DashboardKPIs cheques={cheques} onSelectTab={handleSelectTab} />
              <DashboardCharts cheques={cheques} />

              {/* Quick Recent Records Section */}
              <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">Recent Cheque Activity Register</h3>
                  <button
                    onClick={() => handleSelectTab('cheques')}
                    className="text-xs font-bold text-blue-600 hover:underline dark:text-blue-400"
                  >
                    View All Cheques →
                  </button>
                </div>
                <ChequeTable
                  cheques={activeCheques.slice(0, 10)}
                  selectedIds={selectedIds}
                  onToggleSelect={handleToggleSelect}
                  onToggleSelectAll={handleToggleSelectAll}
                  onViewDetail={(c) => setViewingCheque(c)}
                  onEdit={(c) => {
                    setEditingCheque(c);
                    setIsDuplicateMode(false);
                    setIsFormModalOpen(true);
                  }}
                  onDuplicate={(c) => {
                    setEditingCheque(c);
                    setIsDuplicateMode(true);
                    setIsFormModalOpen(true);
                  }}
                  onDelete={(id) => {
                    storageService.deleteCheque(id);
                    showToast('Cheque deleted.');
                  }}
                />
              </div>
            </div>
          )}

          {/* CHEQUES / OUTSTANDING / CLEARED / RETURNED TABS */}
          {(activeTab === 'cheques' || activeTab === 'outstanding' || activeTab === 'cleared' || activeTab === 'returned') && (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h2 className="text-base font-bold text-slate-900 dark:text-white">
                    {filter.status === 'Outstanding'
                      ? 'Outstanding Cheques (Awaiting Voucher Clearance)'
                      : filter.status === 'Cleared'
                      ? 'Cleared Cheques (Voucher Applied)'
                      : filter.status === 'Returned'
                      ? 'Returned to Customer Cheques'
                      : 'All Registered Cheques Data Grid'}
                  </h2>
                  <p className="text-xs text-slate-500">
                    Showing {filteredCheques.length} records. Search instantly or apply filters.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleBulkExport()}
                    className="flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 shadow-sm hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                  >
                    <FileSpreadsheet className="h-4 w-4 text-emerald-600" />
                    <span>Export Grid Excel</span>
                  </button>

                  <button
                    onClick={() => printChequeList(filteredCheques, settings, 'Cheque Register')}
                    className="flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 shadow-sm hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                  >
                    <Printer className="h-4 w-4 text-blue-600" />
                    <span>Print Table</span>
                  </button>

                  <button
                    onClick={() => {
                      setEditingCheque(null);
                      setIsDuplicateMode(false);
                      setIsFormModalOpen(true);
                    }}
                    className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-1.5 text-xs font-bold text-white shadow transition hover:bg-blue-700"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Add Cheque</span>
                  </button>
                </div>
              </div>

              {/* Cheque Management KPI Summary Cards (Total, Outstanding, Cleared, Returned Qty & Amount) */}
              <ChequeStatsSummary
                cheques={cheques}
                filter={filter}
                onFilterChange={(newF) => setFilter((f) => ({ ...f, ...newF }))}
              />

              {/* Bulk Action Bar */}
              <BulkActionToolbar
                selectedCount={selectedIds.length}
                onClearSelection={() => setSelectedIds([])}
                onBulkMarkCleared={handleBulkMarkCleared}
                onBulkDelete={handleBulkDelete}
                onBulkExport={handleBulkExport}
              />

              {/* Quick Filter Bar */}
              <QuickFilterBar
                filter={filter}
                onFilterChange={(updates) => setFilter((prev) => ({ ...prev, ...updates }))}
                onResetFilter={() => {
                  setFilter({ searchQuery: '', status: 'ALL' });
                  setSearchQuery('');
                }}
                banks={storageService.getBanks()}
                cities={storageService.getCities()}
                employees={storageService.getEmployees()}
              />

              {/* Data Grid Table */}
              <ChequeTable
                cheques={filteredCheques}
                selectedIds={selectedIds}
                onToggleSelect={handleToggleSelect}
                onToggleSelectAll={handleToggleSelectAll}
                onViewDetail={(c) => setViewingCheque(c)}
                onEdit={(c) => {
                  setEditingCheque(c);
                  setIsDuplicateMode(false);
                  setIsFormModalOpen(true);
                }}
                onDuplicate={(c) => {
                  setEditingCheque(c);
                  setIsDuplicateMode(true);
                  setIsFormModalOpen(true);
                }}
                onDelete={(id) => {
                  storageService.deleteCheque(id);
                  showToast('Cheque deleted.');
                }}
              />
            </div>
          )}

          {/* UTILITIES TAB (Contains Master Data, Reports, Import, Backup, Settings, About) */}
          {(activeTab === 'utilities' || ['master', 'reports', 'import', 'export', 'backup', 'settings', 'about'].includes(activeTab)) && (
            <UtilitiesView
              onOpenShortcuts={() => setIsShortcutsOpen(true)}
              onImportComplete={() => handleSelectTab('cheques')}
            />
          )}
        </main>
      </div>

      {/* Add / Edit Cheque Modal */}
      <ChequeFormModal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        initialData={editingCheque || undefined}
        isDuplicateMode={isDuplicateMode}
      />

      {/* Cheque Detail Drawer */}
      <ChequeDetailModal
        cheque={viewingCheque}
        onClose={() => setViewingCheque(null)}
        onEdit={(c) => {
          setEditingCheque(c);
          setIsDuplicateMode(false);
          setIsFormModalOpen(true);
        }}
        onDuplicate={(c) => {
          setEditingCheque(c);
          setIsDuplicateMode(true);
          setIsFormModalOpen(true);
        }}
        onDelete={(id) => {
          storageService.deleteCheque(id);
          showToast('Cheque deleted.');
        }}
      />

      {/* Keyboard Shortcuts Sheet */}
      <ShortcutsModal isOpen={isShortcutsOpen} onClose={() => setIsShortcutsOpen(false)} />

      {/* Audit Logs Drawer */}
      <NotificationsDrawer
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
        logs={auditLogs}
      />
    </div>
  );
}

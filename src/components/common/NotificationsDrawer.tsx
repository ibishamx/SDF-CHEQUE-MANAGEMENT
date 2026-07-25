import React from 'react';
import { X, Bell, Clock, ShieldAlert, CheckCircle, PlusCircle, Trash2, Edit } from 'lucide-react';
import { AuditLog } from '../../types';

interface NotificationsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  logs: AuditLog[];
}

export const NotificationsDrawer: React.FC<NotificationsDrawerProps> = ({ isOpen, onClose, logs }) => {
  if (!isOpen) return null;

  const renderIcon = (action: AuditLog['action']) => {
    switch (action) {
      case 'CREATE':
        return <PlusCircle className="h-4 w-4 text-emerald-500" />;
      case 'UPDATE':
        return <Edit className="h-4 w-4 text-blue-500" />;
      case 'DELETE':
        return <Trash2 className="h-4 w-4 text-rose-500" />;
      case 'BACKUP':
        return <CheckCircle className="h-4 w-4 text-amber-500" />;
      default:
        return <Clock className="h-4 w-4 text-slate-400" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/50 backdrop-blur-xs">
      <div className="w-full max-w-md h-full bg-white shadow-2xl dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 flex flex-col animate-in slide-in-from-right duration-200">
        <div className="p-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-blue-400" />
            <h3 className="font-bold text-sm">System Audit Logs & Notifications</h3>
          </div>
          <button onClick={onClose} className="rounded p-1 hover:bg-slate-800 text-slate-400 hover:text-white">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 divide-y divide-slate-100 dark:divide-slate-800">
          {logs.length === 0 ? (
            <p className="text-xs text-slate-400 text-center py-8">No recent audit logs available.</p>
          ) : (
            logs.map((log) => (
              <div key={log.id} className="py-3 flex items-start gap-3">
                <div className="mt-0.5">{renderIcon(log.action)}</div>
                <div className="flex-1 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-800 dark:text-slate-200 uppercase">{log.action}</span>
                    <span className="text-[10px] text-slate-400">
                      {new Date(log.timestamp).toLocaleTimeString('en-PK', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className="text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">{log.details}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

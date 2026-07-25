export type ChequeStatus = 'Outstanding' | 'Cleared' | 'Returned';

export interface Cheque {
  id: string;
  receiveDate: string; // YYYY-MM-DD
  receiveFrom: string; // Party Name (Receive From / Customer)
  city: string;
  bank: string;
  chequeNumber: string;
  chequeDate: string; // YYYY-MM-DD
  amount: number;
  receivedBy: string; // Employee Name
  paidDate?: string; // YYYY-MM-DD
  paidTo?: string; // Paid To Party Name / Disbursed Account
  voucherNumber?: string;
  status: ChequeStatus; // 'Outstanding' | 'Cleared' | 'Returned'
  returnDate?: string; // YYYY-MM-DD (Date returned to customer)
  returnReason?: string; // Reason for returning cheque to customer
  remarks?: string;
  isDeleted?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Party {
  id: string;
  name: string;
  city: string;
  phone?: string;
  address?: string;
  contactPerson?: string;
  createdAt: string;
}

export interface Bank {
  id: string;
  name: string;
  branchCode?: string;
  city?: string;
}

export interface City {
  id: string;
  name: string;
  province?: string;
}

export interface Employee {
  id: string;
  name: string;
  designation: string;
  phone?: string;
  department?: string;
}

export interface CompanySettings {
  companyName: string;
  tagline: string;
  address: string;
  phone: string;
  email: string;
  ntn?: string;
  strn?: string;
  currency: string;
  dateFormat: string;
  theme: 'light' | 'dark' | 'system';
  backupFolder: string;
  exportFolder: string;
  autoBackupSchedule: 'daily' | 'weekly' | 'monthly' | 'disabled';
  logoUrl?: string;
}

export interface BackupRecord {
  id: string;
  fileName: string;
  createdAt: string;
  totalRecords: number;
  fileSizeKb: number;
  type: 'manual' | 'auto';
}

export interface AuditLog {
  id: string;
  timestamp: string;
  action: 'CREATE' | 'UPDATE' | 'DELETE' | 'RESTORE' | 'IMPORT' | 'BACKUP' | 'RESTORE_DB';
  details: string;
  user?: string;
}

export interface FilterState {
  searchQuery: string;
  status: 'ALL' | 'Outstanding' | 'Cleared' | 'Returned';
  startDate?: string;
  endDate?: string;
  bank?: string;
  city?: string;
  employee?: string;
  party?: string;
  paidTo?: string;
  minAmount?: number;
  maxAmount?: number;
}

export interface PaginationState {
  page: number;
  pageSize: number;
}

export interface SortState {
  field: keyof Cheque;
  direction: 'asc' | 'desc';
}

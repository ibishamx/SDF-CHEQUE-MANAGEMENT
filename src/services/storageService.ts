import {
  Cheque,
  Party,
  Bank,
  City,
  Employee,
  CompanySettings,
  BackupRecord,
  AuditLog,
} from '../types';
import {
  INITIAL_CHEQUES,
  INITIAL_PARTIES,
  INITIAL_BANKS,
  INITIAL_CITIES,
  INITIAL_EMPLOYEES,
  INITIAL_SETTINGS,
} from '../data/seedData';

const KEYS = {
  CHEQUES: 'saleem_daal_cheques_v1',
  PARTIES: 'saleem_daal_parties_v1',
  BANKS: 'saleem_daal_banks_v1',
  CITIES: 'saleem_daal_cities_v1',
  EMPLOYEES: 'saleem_daal_employees_v1',
  SETTINGS: 'saleem_daal_settings_v1',
  BACKUPS: 'saleem_daal_backups_v1',
  AUDIT_LOGS: 'saleem_daal_audit_logs_v1',
};

type StorageListener = () => void;
const listeners: Set<StorageListener> = new Set();

export function subscribeStorage(listener: StorageListener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function notifyListeners() {
  listeners.forEach((listener) => listener());
}

// Helper to compute status automatically based on Voucher Number & Return Date requirements
export function computeChequeStatus(
  voucherNumber?: string,
  returnDate?: string,
  explicitStatus?: Cheque['status']
): 'Outstanding' | 'Cleared' | 'Returned' {
  if (explicitStatus === 'Returned' || (returnDate && returnDate.trim().length > 0)) {
    return 'Returned';
  }
  if (explicitStatus === 'Cleared' || (voucherNumber && voucherNumber.trim().length > 0)) {
    return 'Cleared';
  }
  return 'Outstanding';
}

class StorageService {
  private cheques: Cheque[] = [];
  private parties: Party[] = [];
  private banks: Bank[] = [];
  private cities: City[] = [];
  private employees: Employee[] = [];
  private settings: CompanySettings = INITIAL_SETTINGS;
  private backups: BackupRecord[] = [];
  private auditLogs: AuditLog[] = [];

  constructor() {
    this.init();
  }

  private init() {
    try {
      const storedCheques = localStorage.getItem(KEYS.CHEQUES);
      if (storedCheques) {
        this.cheques = JSON.parse(storedCheques);
        // Ensure status calculation for legacy items
        this.cheques = this.cheques.map((c) => ({
          ...c,
          status: computeChequeStatus(c.voucherNumber, c.returnDate, c.status),
        }));
      } else {
        this.cheques = INITIAL_CHEQUES;
        this.saveCheques();
      }

      const storedParties = localStorage.getItem(KEYS.PARTIES);
      this.parties = storedParties ? JSON.parse(storedParties) : INITIAL_PARTIES;
      if (!storedParties) this.saveParties();

      const storedBanks = localStorage.getItem(KEYS.BANKS);
      this.banks = storedBanks ? JSON.parse(storedBanks) : INITIAL_BANKS;
      if (!storedBanks) this.saveBanks();

      const storedCities = localStorage.getItem(KEYS.CITIES);
      this.cities = storedCities ? JSON.parse(storedCities) : INITIAL_CITIES;
      if (!storedCities) this.saveCities();

      const storedEmployees = localStorage.getItem(KEYS.EMPLOYEES);
      this.employees = storedEmployees ? JSON.parse(storedEmployees) : INITIAL_EMPLOYEES;
      if (!storedEmployees) this.saveEmployees();

      const storedSettings = localStorage.getItem(KEYS.SETTINGS);
      this.settings = storedSettings ? JSON.parse(storedSettings) : INITIAL_SETTINGS;
      if (!storedSettings) this.saveSettings();

      const storedBackups = localStorage.getItem(KEYS.BACKUPS);
      this.backups = storedBackups ? JSON.parse(storedBackups) : [];

      const storedLogs = localStorage.getItem(KEYS.AUDIT_LOGS);
      this.auditLogs = storedLogs ? JSON.parse(storedLogs) : [];
      if (this.auditLogs.length === 0) {
        this.logAudit('CREATE', 'System initialized with default seed records for Saleem Daal Factory');
      }
    } catch (e) {
      console.error('Failed to initialize local storage:', e);
      this.cheques = INITIAL_CHEQUES;
      this.parties = INITIAL_PARTIES;
      this.banks = INITIAL_BANKS;
      this.cities = INITIAL_CITIES;
      this.employees = INITIAL_EMPLOYEES;
      this.settings = INITIAL_SETTINGS;
    }
  }

  private saveCheques() {
    localStorage.setItem(KEYS.CHEQUES, JSON.stringify(this.cheques));
    notifyListeners();
  }

  private saveParties() {
    localStorage.setItem(KEYS.PARTIES, JSON.stringify(this.parties));
    notifyListeners();
  }

  private saveBanks() {
    localStorage.setItem(KEYS.BANKS, JSON.stringify(this.banks));
    notifyListeners();
  }

  private saveCities() {
    localStorage.setItem(KEYS.CITIES, JSON.stringify(this.cities));
    notifyListeners();
  }

  private saveEmployees() {
    localStorage.setItem(KEYS.EMPLOYEES, JSON.stringify(this.employees));
    notifyListeners();
  }

  private saveSettings() {
    localStorage.setItem(KEYS.SETTINGS, JSON.stringify(this.settings));
    notifyListeners();
  }

  private saveBackups() {
    localStorage.setItem(KEYS.BACKUPS, JSON.stringify(this.backups));
    notifyListeners();
  }

  private saveAuditLogs() {
    localStorage.setItem(KEYS.AUDIT_LOGS, JSON.stringify(this.auditLogs));
    notifyListeners();
  }

  public logAudit(action: AuditLog['action'], details: string) {
    const log: AuditLog = {
      id: 'log-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4),
      timestamp: new Date().toISOString(),
      action,
      details,
      user: 'Office User',
    };
    this.auditLogs.unshift(log);
    if (this.auditLogs.length > 200) {
      this.auditLogs = this.auditLogs.slice(0, 200);
    }
    this.saveAuditLogs();
  }

  // --- CHEQUES CRUD ---
  public getCheques(includeDeleted = false): Cheque[] {
    if (includeDeleted) return [...this.cheques];
    return this.cheques.filter((c) => !c.isDeleted);
  }

  public getChequeById(id: string): Cheque | undefined {
    return this.cheques.find((c) => c.id === id);
  }

  public addCheque(chequeData: Omit<Cheque, 'id' | 'status' | 'createdAt' | 'updatedAt'> & { status?: Cheque['status'] }): Cheque {
    const now = new Date().toISOString();
    const computedStatus = chequeData.status || computeChequeStatus(chequeData.voucherNumber, chequeData.returnDate);

    const newCheque: Cheque = {
      ...chequeData,
      id: 'chq-' + Date.now() + '-' + Math.floor(Math.random() * 1000),
      status: computedStatus,
      createdAt: now,
      updatedAt: now,
    };

    // Automatically register party/bank/city if new
    this.autoAddMasterData(newCheque.receiveFrom, newCheque.bank, newCheque.city, newCheque.receivedBy);

    this.cheques.unshift(newCheque);
    this.saveCheques();
    this.logAudit('CREATE', `Added Cheque #${newCheque.chequeNumber} for ${newCheque.receiveFrom} (${newCheque.amount.toLocaleString()} PKR)`);
    return newCheque;
  }

  public updateCheque(id: string, updates: Partial<Omit<Cheque, 'id' | 'createdAt'>>): Cheque {
    const index = this.cheques.findIndex((c) => c.id === id);
    if (index === -1) throw new Error(`Cheque with ID ${id} not found.`);

    const existing = this.cheques[index];
    const updatedVoucher = updates.voucherNumber !== undefined ? updates.voucherNumber : existing.voucherNumber;
    const updatedReturnDate = updates.returnDate !== undefined ? updates.returnDate : existing.returnDate;
    const explicitStatus = updates.status !== undefined ? updates.status : existing.status;

    const computedStatus = computeChequeStatus(updatedVoucher, updatedReturnDate, explicitStatus);

    const updatedCheque: Cheque = {
      ...existing,
      ...updates,
      status: computedStatus,
      updatedAt: new Date().toISOString(),
    };

    this.autoAddMasterData(updatedCheque.receiveFrom, updatedCheque.bank, updatedCheque.city, updatedCheque.receivedBy);

    this.cheques[index] = updatedCheque;
    this.saveCheques();
    this.logAudit('UPDATE', `Updated Cheque #${updatedCheque.chequeNumber} (${updatedCheque.receiveFrom}) - Status: ${computedStatus}`);
    return updatedCheque;
  }

  public deleteCheque(id: string, permanent = false) {
    const cheque = this.getChequeById(id);
    if (!cheque) return;

    if (permanent) {
      this.cheques = this.cheques.filter((c) => c.id !== id);
      this.logAudit('DELETE', `Permanently deleted Cheque #${cheque.chequeNumber}`);
    } else {
      cheque.isDeleted = true;
      cheque.updatedAt = new Date().toISOString();
      this.logAudit('DELETE', `Soft-deleted Cheque #${cheque.chequeNumber}`);
    }
    this.saveCheques();
  }

  public restoreCheque(id: string) {
    const cheque = this.cheques.find((c) => c.id === id);
    if (cheque) {
      cheque.isDeleted = false;
      cheque.updatedAt = new Date().toISOString();
      this.saveCheques();
      this.logAudit('RESTORE', `Restored deleted Cheque #${cheque.chequeNumber}`);
    }
  }

  public bulkDelete(ids: string[]) {
    this.cheques = this.cheques.map((c) => {
      if (ids.includes(c.id)) {
        return { ...c, isDeleted: true, updatedAt: new Date().toISOString() };
      }
      return c;
    });
    this.saveCheques();
    this.logAudit('DELETE', `Bulk soft-deleted ${ids.length} cheques`);
  }

  public bulkMarkCleared(ids: string[], voucherPrefix = 'V-CLEARED', paidDate = new Date().toISOString().split('T')[0]) {
    let updatedCount = 0;
    this.cheques = this.cheques.map((c, i) => {
      if (ids.includes(c.id) && !c.voucherNumber) {
        updatedCount++;
        const voucher = `${voucherPrefix}-${100 + i}`;
        return {
          ...c,
          voucherNumber: voucher,
          paidDate,
          paidTo: c.paidTo || 'Saleem Daal Main A/C',
          status: 'Cleared' as const,
          updatedAt: new Date().toISOString(),
        };
      }
      return c;
    });
    this.saveCheques();
    this.logAudit('UPDATE', `Bulk marked ${updatedCount} cheques as Cleared`);
  }

  public markAsReturned(id: string, returnReason = 'Returned to Customer', returnDate = new Date().toISOString().split('T')[0]) {
    const cheque = this.getChequeById(id);
    if (!cheque) return;

    cheque.status = 'Returned';
    cheque.returnDate = returnDate;
    cheque.returnReason = returnReason;
    cheque.updatedAt = new Date().toISOString();

    this.saveCheques();
    this.logAudit('UPDATE', `Returned Cheque #${cheque.chequeNumber} (${cheque.receiveFrom}) to Customer - Reason: ${returnReason}`);
  }

  public bulkMarkReturned(ids: string[], returnReason = 'Returned to Customer', returnDate = new Date().toISOString().split('T')[0]) {
    let count = 0;
    this.cheques = this.cheques.map((c) => {
      if (ids.includes(c.id)) {
        count++;
        return {
          ...c,
          status: 'Returned' as const,
          returnDate,
          returnReason,
          updatedAt: new Date().toISOString(),
        };
      }
      return c;
    });
    this.saveCheques();
    this.logAudit('UPDATE', `Bulk returned ${count} cheques to customer`);
  }

  private autoAddMasterData(partyName: string, bankName: string, cityName: string, empName: string) {
    if (partyName && !this.parties.some((p) => p.name.toLowerCase() === partyName.toLowerCase())) {
      this.addParty({ name: partyName, city: cityName || 'Faisalabad' });
    }
    if (bankName && !this.banks.some((b) => b.name.toLowerCase() === bankName.toLowerCase())) {
      this.addBank({ name: bankName });
    }
    if (cityName && !this.cities.some((c) => c.name.toLowerCase() === cityName.toLowerCase())) {
      this.addCity({ name: cityName });
    }
    if (empName && !this.employees.some((e) => e.name.toLowerCase() === empName.toLowerCase())) {
      this.addEmployee({ name: empName, designation: 'Representative', department: 'Sales' });
    }
  }

  // --- MASTER DATA ---
  public getParties(): Party[] {
    return [...this.parties];
  }
  public addParty(data: Partial<Party> & { name: string }): Party {
    const party: Party = {
      id: 'p-' + Date.now() + '-' + Math.random().toString(36).substr(2, 3),
      name: data.name,
      city: data.city || 'Faisalabad',
      phone: data.phone || '',
      contactPerson: data.contactPerson || '',
      createdAt: new Date().toISOString(),
    };
    this.parties.push(party);
    this.saveParties();
    return party;
  }

  public getBanks(): Bank[] {
    return [...this.banks];
  }
  public addBank(data: Partial<Bank> & { name: string }): Bank {
    const bank: Bank = {
      id: 'b-' + Date.now() + '-' + Math.random().toString(36).substr(2, 3),
      name: data.name,
      branchCode: data.branchCode || '',
      city: data.city || 'Faisalabad',
    };
    this.banks.push(bank);
    this.saveBanks();
    return bank;
  }

  public getCities(): City[] {
    return [...this.cities];
  }
  public addCity(data: Partial<City> & { name: string }): City {
    const city: City = {
      id: 'c-' + Date.now() + '-' + Math.random().toString(36).substr(2, 3),
      name: data.name,
      province: data.province || 'Punjab',
    };
    this.cities.push(city);
    this.saveCities();
    return city;
  }

  public getEmployees(): Employee[] {
    return [...this.employees];
  }
  public addEmployee(data: Partial<Employee> & { name: string }): Employee {
    const emp: Employee = {
      id: 'e-' + Date.now() + '-' + Math.random().toString(36).substr(2, 3),
      name: data.name,
      designation: data.designation || 'Staff',
      department: data.department || 'Accounts',
    };
    this.employees.push(emp);
    this.saveEmployees();
    return emp;
  }

  // --- SETTINGS ---
  public getSettings(): CompanySettings {
    return { ...this.settings };
  }
  public updateSettings(newSettings: Partial<CompanySettings>) {
    this.settings = { ...this.settings, ...newSettings };
    this.saveSettings();
    this.logAudit('UPDATE', 'Updated company settings & preferences');
  }

  // --- BACKUPS & AUDIT LOGS ---
  public getBackups(): BackupRecord[] {
    return [...this.backups];
  }

  public getAuditLogs(): AuditLog[] {
    return [...this.auditLogs];
  }

  public createBackup(type: 'manual' | 'auto' = 'manual'): BackupRecord {
    const payload = {
      version: '1.0.0',
      system: 'Saleem Daal Factory Cheque Management System',
      timestamp: new Date().toISOString(),
      cheques: this.cheques,
      parties: this.parties,
      banks: this.banks,
      cities: this.cities,
      employees: this.employees,
      settings: this.settings,
      auditLogs: this.auditLogs,
    };

    const jsonStr = JSON.stringify(payload);
    const sizeKb = Math.round(jsonStr.length / 1024);
    const dateStr = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 16);
    const fileName = `SaleemDaalFactory_Backup_${dateStr}.json`;

    const record: BackupRecord = {
      id: 'bkp-' + Date.now(),
      fileName,
      createdAt: new Date().toISOString(),
      totalRecords: this.cheques.length,
      fileSizeKb: sizeKb,
      type,
    };

    this.backups.unshift(record);
    this.saveBackups();
    this.logAudit('BACKUP', `Created ${type} backup (${fileName}) with ${this.cheques.length} records`);

    return record;
  }

  public exportBackupJson(): string {
    const payload = {
      version: '1.0.0',
      system: 'Saleem Daal Factory Cheque Management System',
      exportDate: new Date().toISOString(),
      cheques: this.cheques,
      parties: this.parties,
      banks: this.banks,
      cities: this.cities,
      employees: this.employees,
      settings: this.settings,
      auditLogs: this.auditLogs,
    };
    return JSON.stringify(payload, null, 2);
  }

  public restoreFromJson(jsonString: string): { success: boolean; message: string; count?: number } {
    try {
      const data = JSON.parse(jsonString);
      if (!data || !Array.isArray(data.cheques)) {
        return { success: false, message: 'Invalid backup file structure. Missing cheques dataset.' };
      }

      this.cheques = data.cheques.map((c: Cheque) => ({
        ...c,
        status: computeChequeStatus(c.voucherNumber),
      }));

      if (Array.isArray(data.parties)) this.parties = data.parties;
      if (Array.isArray(data.banks)) this.banks = data.banks;
      if (Array.isArray(data.cities)) this.cities = data.cities;
      if (Array.isArray(data.employees)) this.employees = data.employees;
      if (data.settings) this.settings = data.settings;

      this.saveCheques();
      this.saveParties();
      this.saveBanks();
      this.saveCities();
      this.saveEmployees();
      this.saveSettings();

      this.logAudit('RESTORE_DB', `Restored database with ${this.cheques.length} cheque records`);
      return { success: true, message: `Successfully restored ${this.cheques.length} records.`, count: this.cheques.length };
    } catch (err: any) {
      return { success: false, message: 'Failed to parse backup JSON: ' + (err?.message || 'Syntax error') };
    }
  }

  public resetToSeedData() {
    this.cheques = INITIAL_CHEQUES;
    this.parties = INITIAL_PARTIES;
    this.banks = INITIAL_BANKS;
    this.cities = INITIAL_CITIES;
    this.employees = INITIAL_EMPLOYEES;
    this.settings = INITIAL_SETTINGS;
    this.saveCheques();
    this.saveParties();
    this.saveBanks();
    this.saveCities();
    this.saveEmployees();
    this.saveSettings();
    this.logAudit('RESTORE_DB', 'Reset application database to initial factory seed dataset');
  }
}

export const storageService = new StorageService();

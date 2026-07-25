import React, { useState, useEffect } from 'react';
import {
  Users,
  Building2,
  MapPin,
  UserCheck,
  Plus,
  Search,
  Building,
  Phone,
  Briefcase,
} from 'lucide-react';
import { storageService, subscribeStorage } from '../../services/storageService';
import { Party, Bank, City, Employee } from '../../types';

export const MasterDataManager: React.FC = () => {
  const [activeSubTab, setActiveSubTab] = useState<'parties' | 'banks' | 'cities' | 'employees'>('parties');

  const [parties, setParties] = useState<Party[]>(storageService.getParties());
  const [banks, setBanks] = useState<Bank[]>(storageService.getBanks());
  const [cities, setCities] = useState<City[]>(storageService.getCities());
  const [employees, setEmployees] = useState<Employee[]>(storageService.getEmployees());

  const [search, setSearch] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);

  useEffect(() => {
    const unsubscribe = subscribeStorage(() => {
      setParties(storageService.getParties());
      setBanks(storageService.getBanks());
      setCities(storageService.getCities());
      setEmployees(storageService.getEmployees());
    });
    return unsubscribe;
  }, []);

  // Form states for new entry
  const [partyName, setPartyName] = useState('');
  const [partyCity, setPartyCity] = useState('Faisalabad');
  const [partyPhone, setPartyPhone] = useState('');
  const [partyContact, setPartyContact] = useState('');

  const [bankName, setBankName] = useState('');
  const [branchCode, setBranchCode] = useState('');

  const [cityName, setCityName] = useState('');
  const [province, setProvince] = useState('Punjab');

  const [empName, setEmpName] = useState('');
  const [empDesignation, setEmpDesignation] = useState('Collector');
  const [empDept, setEmpDept] = useState('Sales & Field');

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (activeSubTab === 'parties') {
      if (!partyName.trim()) return;
      storageService.addParty({
        name: partyName.trim(),
        city: partyCity.trim(),
        phone: partyPhone.trim(),
        contactPerson: partyContact.trim(),
      });
      setPartyName('');
      setPartyPhone('');
      setPartyContact('');
    } else if (activeSubTab === 'banks') {
      if (!bankName.trim()) return;
      storageService.addBank({
        name: bankName.trim(),
        branchCode: branchCode.trim(),
      });
      setBankName('');
      setBranchCode('');
    } else if (activeSubTab === 'cities') {
      if (!cityName.trim()) return;
      storageService.addCity({
        name: cityName.trim(),
        province: province.trim(),
      });
      setCityName('');
    } else if (activeSubTab === 'employees') {
      if (!empName.trim()) return;
      storageService.addEmployee({
        name: empName.trim(),
        designation: empDesignation.trim(),
        department: empDept.trim(),
      });
      setEmpName('');
    }

    setShowAddModal(false);
  };

  const cheques = storageService.getCheques();

  // Helper to count associated cheques
  const getPartyChequeCount = (name: string) =>
    cheques.filter((c) => c.receiveFrom.toLowerCase() === name.toLowerCase()).length;
  const getBankChequeCount = (name: string) =>
    cheques.filter((c) => c.bank.toLowerCase().includes(name.toLowerCase())).length;
  const getCityChequeCount = (name: string) =>
    cheques.filter((c) => c.city.toLowerCase() === name.toLowerCase()).length;
  const getEmployeeChequeCount = (name: string) =>
    cheques.filter((c) => c.receivedBy.toLowerCase() === name.toLowerCase()).length;

  return (
    <div className="space-y-6">
      {/* Subtab Navigation & Add Button */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-4 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveSubTab('parties')}
            className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition ${
              activeSubTab === 'parties'
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700'
            }`}
          >
            <Users className="h-4 w-4" />
            <span>Parties ({parties.length})</span>
          </button>

          <button
            onClick={() => setActiveSubTab('banks')}
            className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition ${
              activeSubTab === 'banks'
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700'
            }`}
          >
            <Building2 className="h-4 w-4" />
            <span>Banks ({banks.length})</span>
          </button>

          <button
            onClick={() => setActiveSubTab('cities')}
            className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition ${
              activeSubTab === 'cities'
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700'
            }`}
          >
            <MapPin className="h-4 w-4" />
            <span>Cities ({cities.length})</span>
          </button>

          <button
            onClick={() => setActiveSubTab('employees')}
            className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition ${
              activeSubTab === 'employees'
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700'
            }`}
          >
            <UserCheck className="h-4 w-4" />
            <span>Employees ({employees.length})</span>
          </button>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search master list..."
              className="rounded-lg border border-slate-300 bg-white py-1.5 pl-8 pr-3 text-xs text-slate-800 focus:border-blue-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            />
          </div>

          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-3.5 py-1.5 text-xs font-bold text-white shadow hover:bg-blue-700"
          >
            <Plus className="h-4 w-4" />
            <span>
              Add New{' '}
              {activeSubTab === 'parties'
                ? 'Party'
                : activeSubTab === 'banks'
                ? 'Bank'
                : activeSubTab === 'cities'
                ? 'City'
                : 'Employee'}
            </span>
          </button>
        </div>
      </div>

      {/* PARTIES TAB */}
      {activeSubTab === 'parties' && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {parties
            .filter((p) => p.name.toLowerCase().includes(search.toLowerCase()) || p.city.toLowerCase().includes(search.toLowerCase()))
            .map((p) => {
              const count = getPartyChequeCount(p.name);
              return (
                <div
                  key={p.id}
                  className="flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900"
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white">{p.name}</h4>
                      <span className="rounded-md bg-blue-50 px-2 py-0.5 text-[10px] font-bold text-blue-700 dark:bg-blue-950 dark:text-blue-300">
                        {p.city}
                      </span>
                    </div>

                    {p.contactPerson && (
                      <p className="mt-2 text-xs text-slate-600 dark:text-slate-400">
                        Contact: <strong>{p.contactPerson}</strong>
                      </p>
                    )}

                    {p.phone && (
                      <p className="mt-1 flex items-center gap-1 text-xs text-slate-500">
                        <Phone className="h-3 w-3 text-slate-400" />
                        <span>{p.phone}</span>
                      </p>
                    )}
                  </div>

                  <div className="mt-4 border-t border-slate-100 pt-2.5 flex items-center justify-between text-xs text-slate-500 dark:border-slate-800">
                    <span>Recorded Cheques:</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">{count} Records</span>
                  </div>
                </div>
              );
            })}
        </div>
      )}

      {/* BANKS TAB */}
      {activeSubTab === 'banks' && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {banks
            .filter((b) => b.name.toLowerCase().includes(search.toLowerCase()))
            .map((b) => {
              const count = getBankChequeCount(b.name);
              return (
                <div
                  key={b.id}
                  className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-100 text-blue-700 font-bold dark:bg-blue-900/50 dark:text-blue-300">
                      <Building2 className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white">{b.name}</h4>
                      <p className="text-xs text-slate-500">{b.branchCode || 'Main Branch'}</p>
                    </div>
                  </div>
                  <div className="mt-4 border-t border-slate-100 pt-2 flex items-center justify-between text-xs text-slate-500 dark:border-slate-800">
                    <span>Cheques Registered:</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">{count} Records</span>
                  </div>
                </div>
              );
            })}
        </div>
      )}

      {/* CITIES TAB */}
      {activeSubTab === 'cities' && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {cities
            .filter((c) => c.name.toLowerCase().includes(search.toLowerCase()))
            .map((c) => {
              const count = getCityChequeCount(c.name);
              return (
                <div
                  key={c.id}
                  className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900"
                >
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">{c.name}</h4>
                    <span className="text-[10px] text-slate-400 uppercase font-semibold">{c.province}</span>
                  </div>
                  <div className="mt-3 text-xs text-slate-500 flex justify-between">
                    <span>Cheques:</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">{count} Records</span>
                  </div>
                </div>
              );
            })}
        </div>
      )}

      {/* EMPLOYEES TAB */}
      {activeSubTab === 'employees' && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {employees
            .filter((e) => e.name.toLowerCase().includes(search.toLowerCase()))
            .map((e) => {
              const count = getEmployeeChequeCount(e.name);
              return (
                <div
                  key={e.id}
                  className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-700 font-bold dark:bg-slate-800 dark:text-slate-300">
                      {e.name.charAt(0)}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white">{e.name}</h4>
                      <p className="text-xs text-slate-500">{e.designation} • {e.department}</p>
                    </div>
                  </div>
                  <div className="mt-4 border-t border-slate-100 pt-2 flex items-center justify-between text-xs text-slate-500 dark:border-slate-800">
                    <span>Collections Managed:</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">{count} Records</span>
                  </div>
                </div>
              );
            })}
        </div>
      )}

      {/* Add Master Data Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Add New{' '}
              {activeSubTab === 'parties'
                ? 'Party'
                : activeSubTab === 'banks'
                ? 'Bank'
                : activeSubTab === 'cities'
                ? 'City'
                : 'Employee'}
            </h3>

            <form onSubmit={handleAddSubmit} className="mt-4 space-y-3">
              {activeSubTab === 'parties' && (
                <>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Party Name *
                    </label>
                    <input
                      type="text"
                      value={partyName}
                      onChange={(e) => setPartyName(e.target.value)}
                      placeholder="e.g. Al-Madina Grain Traders"
                      required
                      className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      City
                    </label>
                    <input
                      type="text"
                      value={partyCity}
                      onChange={(e) => setPartyCity(e.target.value)}
                      placeholder="City..."
                      className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Contact Person
                    </label>
                    <input
                      type="text"
                      value={partyContact}
                      onChange={(e) => setPartyContact(e.target.value)}
                      placeholder="e.g. Haji Aslam"
                      className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                    />
                  </div>
                </>
              )}

              {activeSubTab === 'banks' && (
                <>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Bank Name *
                    </label>
                    <input
                      type="text"
                      value={bankName}
                      onChange={(e) => setBankName(e.target.value)}
                      placeholder="e.g. Meezan Bank"
                      required
                      className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Branch Code / Detail
                    </label>
                    <input
                      type="text"
                      value={branchCode}
                      onChange={(e) => setBranchCode(e.target.value)}
                      placeholder="e.g. 0201 - Grain Market"
                      className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                    />
                  </div>
                </>
              )}

              {activeSubTab === 'cities' && (
                <>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      City Name *
                    </label>
                    <input
                      type="text"
                      value={cityName}
                      onChange={(e) => setCityName(e.target.value)}
                      placeholder="e.g. Faisalabad"
                      required
                      className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Province
                    </label>
                    <input
                      type="text"
                      value={province}
                      onChange={(e) => setProvince(e.target.value)}
                      placeholder="e.g. Punjab"
                      className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                    />
                  </div>
                </>
              )}

              {activeSubTab === 'employees' && (
                <>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Employee Name *
                    </label>
                    <input
                      type="text"
                      value={empName}
                      onChange={(e) => setEmpName(e.target.value)}
                      placeholder="e.g. Muhammad Usman"
                      required
                      className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Designation
                    </label>
                    <input
                      type="text"
                      value={empDesignation}
                      onChange={(e) => setEmpDesignation(e.target.value)}
                      placeholder="e.g. Recovery Officer"
                      className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                    />
                  </div>
                </>
              )}

              <div className="flex items-center justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-blue-600 px-4 py-1.5 text-xs font-bold text-white hover:bg-blue-700"
                >
                  Save Entry
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

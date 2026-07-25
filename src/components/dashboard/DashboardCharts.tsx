import React from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  CartesianGrid,
  Legend,
} from 'recharts';
import { Cheque } from '../../types';
import { formatCurrencyPKR } from '../../services/exportService';

interface DashboardChartsProps {
  cheques: Cheque[];
}

const COLORS = ['#1E40AF', '#059669', '#DC2626', '#D97706', '#9333EA', '#0284C7', '#475569'];

export const DashboardCharts: React.FC<DashboardChartsProps> = ({ cheques }) => {
  const activeCheques = cheques.filter((c) => !c.isDeleted);
  const outstandingCheques = activeCheques.filter((c) => c.status === 'Outstanding');

  // 1. Outstanding by City
  const cityMap: Record<string, number> = {};
  outstandingCheques.forEach((c) => {
    cityMap[c.city] = (cityMap[c.city] || 0) + c.amount;
  });
  const cityData = Object.keys(cityMap)
    .map((city) => ({ city, amount: cityMap[city] }))
    .sort((a, b) => b.amount - a.amount);

  // 2. Outstanding by Bank
  const bankMap: Record<string, number> = {};
  outstandingCheques.forEach((c) => {
    // Shorten bank name for axis
    const shortName = c.bank.split('(')[0].trim();
    bankMap[shortName] = (bankMap[shortName] || 0) + c.amount;
  });
  const bankData = Object.keys(bankMap)
    .map((bank) => ({ bank, amount: bankMap[bank] }))
    .sort((a, b) => b.amount - a.amount);

  // 3. Top Parties by Outstanding Amount
  const partyMap: Record<string, number> = {};
  outstandingCheques.forEach((c) => {
    partyMap[c.receiveFrom] = (partyMap[c.receiveFrom] || 0) + c.amount;
  });
  const partyData = Object.keys(partyMap)
    .map((party) => ({ party, amount: partyMap[party] }))
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 5);

  // 4. Status Breakdown
  const totalOutstandingAmt = outstandingCheques.reduce((sum, c) => sum + c.amount, 0);
  const totalClearedAmt = activeCheques
    .filter((c) => c.status === 'Cleared')
    .reduce((sum, c) => sum + c.amount, 0);
  const totalReturnedAmt = activeCheques
    .filter((c) => c.status === 'Returned')
    .reduce((sum, c) => sum + c.amount, 0);

  const pieData = [
    { name: 'Cleared Amount', value: totalClearedAmt, color: '#10B981' },
    { name: 'Outstanding Amount', value: totalOutstandingAmt, color: '#EF4444' },
    { name: 'Returned Amount', value: totalReturnedAmt, color: '#F59E0B' },
  ].filter((d) => d.value > 0);

  return (
    <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
      {/* City Breakdown Bar Chart */}
      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">
          Outstanding Amount by City (PKR)
        </h3>
        <p className="text-xs text-slate-500 mb-4">Pending clearances distributed across trade cities</p>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={cityData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis dataKey="city" tick={{ fontSize: 11 }} />
              <YAxis
                tick={{ fontSize: 10 }}
                tickFormatter={(val) => `Rs. ${(val / 1000000).toFixed(1)}M`}
              />
              <Tooltip
                formatter={(val: any) => [formatCurrencyPKR(Number(val)), 'Outstanding']}
                labelStyle={{ fontWeight: 'bold' }}
              />
              <Bar dataKey="amount" fill="#1E40AF" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Bank Breakdown Bar Chart */}
      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">
          Outstanding Amount by Drawee Bank (PKR)
        </h3>
        <p className="text-xs text-slate-500 mb-4">Pending cheque exposure per banking institution</p>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={bankData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis dataKey="bank" tick={{ fontSize: 10 }} interval={0} angle={-15} textAnchor="end" />
              <YAxis
                tick={{ fontSize: 10 }}
                tickFormatter={(val) => `Rs. ${(val / 1000000).toFixed(1)}M`}
              />
              <Tooltip
                formatter={(val: any) => [formatCurrencyPKR(Number(val)), 'Outstanding']}
                labelStyle={{ fontWeight: 'bold' }}
              />
              <Bar dataKey="amount" fill="#0284C7" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Top Parties Horizontal Bar Chart */}
      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">
          Top 5 Parties by Pending Outstanding Amount
        </h3>
        <p className="text-xs text-slate-500 mb-4">Highest receivables pending clearance</p>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={partyData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
              <XAxis
                type="number"
                tick={{ fontSize: 10 }}
                tickFormatter={(val) => `Rs. ${(val / 1000000).toFixed(1)}M`}
              />
              <YAxis dataKey="party" type="category" tick={{ fontSize: 10 }} width={120} />
              <Tooltip
                formatter={(val: any) => [formatCurrencyPKR(Number(val)), 'Outstanding']}
                labelStyle={{ fontWeight: 'bold' }}
              />
              <Bar dataKey="amount" fill="#D97706" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Cleared vs Outstanding Status Breakdown Pie */}
      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">
          Overall Portfolio Clearances Ratio
        </h3>
        <p className="text-xs text-slate-500 mb-2">Total cleared vs outstanding financial balance</p>
        <div className="h-64 w-full flex items-center justify-center">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={85}
                paddingAngle={4}
                dataKey="value"
                label={({ name, percent }) => `${name.split(' ')[0]}: ${(percent * 100).toFixed(0)}%`}
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip formatter={(val: any) => [formatCurrencyPKR(Number(val)), 'Amount']} />
              <Legend verticalAlign="bottom" height={36} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

'use client';
import styles from '../incoming-stats/IncomingStats.module.css';
import React, { useEffect, useState } from 'react';


const months = [
  { value: 0, label: 'All Months' },
  { value: 1, label: 'January' },
  { value: 2, label: 'February' },
  { value: 3, label: 'March' },
  { value: 4, label: 'April' },
  { value: 5, label: 'May' },
  { value: 6, label: 'June' },
  { value: 7, label: 'July' },
  { value: 8, label: 'August' },
  { value: 9, label: 'September' },
  { value: 10, label: 'October' },
  { value: 11, label: 'November' },
  { value: 12, label: 'December' }
];

const units = ['Kilograms (kg)', 'Pounds (lb)'];

function getYearOptions() {
  const currentYear = new Date().getFullYear();
  const years = [];
  for (let y = currentYear + 1; y >= 2020; y--) {
    years.push(y);
  }
  return years;
}

export default function InventoryPage() {
  const [donors, setDonors] = useState<string[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [tableData, setTableData] = useState<{ [donor: string]: { [cat: string]: number } }>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedMonth, setSelectedMonth] = useState(0);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedUnit, setSelectedUnit] = useState(units[1]); // Default to Pounds (lb)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError('');
        const token = localStorage.getItem('token');
        // Fetch donors
        const donorsRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/donors`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!donorsRes.ok) throw new Error('Failed to fetch donors');
        const donorsData = await donorsRes.json();
        const donorNames = donorsData.map((d: any) => d.name);
        setDonors(donorNames);
        // Fetch categories and their weights for the selected month/year
        const monthParam = selectedMonth === 0 ? 'all' : selectedMonth;
        const catsRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/inventory-categories/filtered?month=${monthParam}&year=${selectedYear}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!catsRes.ok) throw new Error('Failed to fetch inventory categories');
        const catsData = await catsRes.json();
        const catNames = catsData.map((c: any) => c.name);
        setCategories(catNames);
        // Build table: donor rows, category columns
        const table: { [donor: string]: { [cat: string]: number } } = {};
        donorNames.forEach((donor: string) => {
          table[donor] = {};
          catNames.forEach((cat: string) => {
            table[donor][cat] = 0;
          });
        });
        // For now, we don't have donor-specific weights, so we'll use the category weights
        catsData.forEach((c: any) => {
          donorNames.forEach((donor: string) => {
            table[donor][c.name] = c.weight;
          });
        });
        setTableData(table);
      } catch (err) {
        setDonors([]);
        setCategories([]);
        setTableData({});
        setError('Failed to load inventory data.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [selectedMonth, selectedYear, selectedUnit]);

  const convertWeight = (weight: number) => {
    if (selectedUnit === 'Pounds (lb)') {
      return Math.round(weight * 2.20462);
    }
    return Math.round(weight);
  };

  // Helper to get month and year from a record (simulate with dummy date for now)
  // In real data, you would need a date field per item. For now, assume all items are for the current year/month.
  const getItemDate = (item: { name: string; weight: number; date?: string }) => {
    if (item.date) return new Date(item.date);
    return null;
  };

  const handleExportExcel = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('No authentication token found');
        return;
      }
      const params = new URLSearchParams({
        month: selectedMonth.toString(),
        year: selectedYear.toString(),
        unit: selectedUnit
      });
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/inventory/export-table?${params.toString()}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!response.ok) {
        throw new Error('Failed to export data');
      }
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `inventory-${selectedYear}-${selectedMonth}.xlsx`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      alert('Export failed. Please try again.');
    }
  };

  return (
    <main className={styles.main}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
        <div className={styles.pageTitle} style={{ marginBottom: 0 }}>Current Inventory by Donor and Category</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <select
            className={styles.select}
            value={selectedMonth}
            onChange={e => setSelectedMonth(Number(e.target.value))}
            style={{ marginRight: 8 }}
          >
            {months.map(m => (
              <option key={m.value} value={m.value}>{m.label}</option>
            ))}
          </select>
          <select
            className={styles.select}
            value={selectedYear}
            onChange={e => setSelectedYear(Number(e.target.value))}
            style={{ marginRight: 8 }}
          >
            {getYearOptions().map(y => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
          <select
            className={styles.select}
            value={selectedUnit}
            onChange={e => setSelectedUnit(e.target.value)}
            style={{ marginRight: 8 }}
          >
            {units.map(u => (
              <option key={u} value={u}>{u}</option>
            ))}
          </select>
          <button
            onClick={handleExportExcel}
            className={styles.exportBtn}
          >
            Export to Excel
          </button>
        </div>
      </div>
      <div className={styles.tableWrapper}>
        <div className={styles.tableTitle}>Inventory by Donor and Category</div>
        <div className={styles.tableContainer} style={{ overflowX: 'auto' }}>
          {loading ? (
            <div style={{ padding: 32, textAlign: 'center' }}>Loading...</div>
          ) : error ? (
            <div style={{ padding: 32, textAlign: 'center', color: 'red' }}>{error}</div>
          ) : donors.length === 0 || categories.length === 0 ? (
            <div style={{ padding: 32, textAlign: 'center' }}>No inventory data found.</div>
          ) : (
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Donor</th>
                  {categories.map(cat => <th key={cat}>{cat}</th>)}
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                {donors.map((donor: string) => (
                  <tr key={donor}>
                    <td>{donor}</td>
                    {categories.map((cat: string) => (
                      <td key={cat}>{selectedUnit === 'Pounds (lb)' ? (tableData[donor][cat] * 2.20462).toFixed(2) : tableData[donor][cat].toFixed(2)}</td>
                    ))}
                    <td className={styles.totalCol}>{selectedUnit === 'Pounds (lb)' ? (Object.values(tableData[donor]).reduce((sum, val) => sum + val, 0) * 2.20462).toFixed(2) : Object.values(tableData[donor]).reduce((sum, val) => sum + val, 0).toFixed(2)}</td>
                  </tr>
                ))}
                <tr className={styles.monthlyTotalRow}>
                  <td>Total</td>
                  {categories.map((cat: string) => (
                    <td key={cat}>{selectedUnit === 'Pounds (lb)' ? (donors.reduce((sum, donor) => sum + tableData[donor][cat], 0) * 2.20462).toFixed(2) : donors.reduce((sum, donor) => sum + tableData[donor][cat], 0).toFixed(2)}</td>
                  ))}
                  <td className={styles.totalCol}>{selectedUnit === 'Pounds (lb)' ? (donors.reduce((sum, donor) => sum + Object.values(tableData[donor]).reduce((s, v) => s + v, 0), 0) * 2.20462).toFixed(2) : donors.reduce((sum, donor) => sum + Object.values(tableData[donor]).reduce((s, v) => s + v, 0), 0).toFixed(2)}</td>
                </tr>
              </tbody>
            </table>
          )}
        </div>
      </div>
    </main>
  );
} 
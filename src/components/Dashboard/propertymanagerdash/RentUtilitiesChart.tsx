import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import React, { useEffect, useState } from 'react';

interface Property {
  id: string;
  name: string;
}

interface RentUtilitiesChartProps {
  myproperties: Property[];
  selectedProperty: string;
}

export default function RentUtilitiesChart({ myproperties, selectedProperty }: RentUtilitiesChartProps) {
  const [data, setData] = useState<any[]>([]);
  const [selectedMonth, setSelectedMonth] = useState<string>('all');

  // Generate last 12 months for dropdown
  const months = Array.from({ length: 12 }, (_, i) => {
    const d = new Date();
    d.setMonth(d.getMonth() - i);
    return {
      value: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`,
      label: d.toLocaleString('default', { month: 'short', year: 'numeric' })
    };
  });

  useEffect(() => {
    async function fetchData() {
      let url = '';
      if (selectedProperty === 'all') {
        const ids = myproperties.map(p => p.id).join(',');
        url = `/api/properties/utilities?propertyIds=${ids}`;
      } else {
        url = `/api/properties/utilities?propertyId=${selectedProperty}`;
      }
      if (selectedMonth !== 'all') {
        url += (url.includes('?') ? '&' : '?') + `month=${selectedMonth}`;
      }
      try {
        const res = await fetch(url);
        if (!res.ok) throw new Error('Failed to fetch');
        const apiData = await res.json();
        setData(apiData.map((item: any) => ({
          name: item.propertyName,
          rentCollected: item.rentCollected,
          utilitiesPaid: item.utilitiesPaid,
        })));
      } catch (e) {
        setData([]);
      }
    }
    if (myproperties.length > 0) fetchData();
  }, [myproperties, selectedProperty, selectedMonth]);

  return (
    <div className="w-full h-96 p-4 bg-white rounded-2xl shadow-md">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">Rent & Utilities Overview</h2>
        <div>
          <select
            className="border border-gray-300 rounded px-2 py-1 text-sm"
            value={selectedMonth}
            onChange={e => setSelectedMonth(e.target.value)}
          >
            <option value="all">All Months</option>
            {months.map(m => (
              <option key={m.value} value={m.value}>{m.label}</option>
            ))}
          </select>
        </div>
      </div>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="rentCollected" name="Rent Collected" />
          <Bar dataKey="utilitiesPaid" name="Utilities Paid" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

// Example data
const data = [
  {
    name: 'Kips Tower',
    rentCollected: 2000,
    utilitiesPaid: 200,
  },
  {
    name: 'Green View',
    rentCollected: 1600,
    utilitiesPaid: 150,
  },
  {
    name: 'CityPoint',
    rentCollected: 1200,
    utilitiesPaid: 100,
  },
];

export default function RentUtilitiesChart() {
  return (
    <div className="w-full h-96 p-4 bg-white rounded-2xl shadow-md">
      <h2 className="text-xl font-semibold mb-4">Rent & Utilities Overview</h2>
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

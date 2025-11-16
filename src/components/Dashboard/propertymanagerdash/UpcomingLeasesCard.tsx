import { useState, useEffect } from 'react';
import { Calendar } from 'lucide-react';

export function UpcomingLeasesCard({ data }: { data: Lease[] }) {
  const [upcomingLeaseExpiration, setUpcomingLeaseExpiration] = useState(0);
  const [monthsRemaining, setMonthsRemaining] = useState(1); // default 4 months

  useEffect(() => {
    const now = new Date();
    const upperBound = new Date(now);
    upperBound.setMonth(now.getMonth() + monthsRemaining);
    const count: number = Array.isArray(data)
      ? data.filter((lease: Lease) => {
          if (!lease.endDate) return false;
          const end = new Date(lease.endDate);
          return end > now && end <= upperBound;
        }).length
      : 0;
    setUpcomingLeaseExpiration(count);
  }, [monthsRemaining, data]);

  return (
    <div className="bg-white rounded-xl shadow-2xl p-4">
      <div className="flex items-center gap-3 mb-2">
        
          <Calendar className="w-6 h-6 text-blue-600 drop-shadow-lg" style={{ filter: 'drop-shadow(0 2px 6px #06b6daaa)' }} />
        
        <p className="text-sm text-gray-600 font-medium">Upcoming Lease Expirations</p>
      </div>
      <div className="flex items-center gap-2 mb-1">
        <p className="text-2xl font-semibold">{upcomingLeaseExpiration}</p>
        <select
          value={monthsRemaining}
          onChange={(e) => setMonthsRemaining(Number(e.target.value))}
          className="border border-gray-300 rounded px-1 py-0.5 text-sm focus:outline-none focus:ring-1 focus:ring-cyan-400"
        >
          {[1, 2, 3, 4, 5].map((month) => (
            <option key={month} value={month}>
              {month} month{month > 1 ? 's' : ''}
            </option>
          ))}
        </select>
      </div>
      <p className="text-xs text-gray-500 mt-1">
        Leases expiring within selected months
      </p>
    </div>
  );
}

interface Lease {
  endDate?: string;
}

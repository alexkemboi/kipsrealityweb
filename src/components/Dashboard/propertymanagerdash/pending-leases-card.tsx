'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface PendingLease {
  id: string;
  tenant: {
    firstName: string;
    lastName: string;
    email: string;
  };
  unit: {
    unitNumber: string;
  };
  property: {
    name: string | null;
  };
  rentAmount: number;
  startDate: string;
  leaseStatus: string | null;
}

export function PendingLeasesCard() {
  const [leases, setLeases] = useState<PendingLease[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchPendingLeases();
  }, []);

  async function fetchPendingLeases() {
    try {
      setLoading(true);
      const response = await fetch('/api/lease/pending');
      
      if (!response.ok) {
        throw new Error('Failed to fetch pending leases');
      }

      const data = await response.json();
      setLeases(data.leases || []);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }

  async function handleActivateLease(leaseId: string) {
    if (!confirm('Activate this lease? This will generate the first invoice and mark the unit as occupied.')) {
      return;
    }

    try {
      const response = await fetch(`/api/lease/${leaseId}/sign/landlord`, {
        method: 'POST'
      });

      const result = await response.json();

      if (result.success) {
        alert('Lease activated successfully!');
        fetchPendingLeases(); // Refresh the list
      } else {
        alert(`Activation failed: ${result.error}`);
      }
    } catch (err) {
      alert(`Error: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Pending Leases</CardTitle>
          <CardDescription>Loading pending leases...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Pending Leases</CardTitle>
          <CardDescription className="text-red-600">Error: {error}</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Pending Leases</CardTitle>
        <CardDescription>
          {leases.length === 0 
            ? 'No pending leases requiring activation' 
            : `${leases.length} lease${leases.length === 1 ? '' : 's'} awaiting landlord signature`}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {leases.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p>All leases are processed!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {leases.map((lease) => (
              <div
                key={lease.id}
                className="p-4 border rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-semibold text-lg">
                        {lease.tenant.firstName} {lease.tenant.lastName}
                      </h3>
                      <Badge variant="secondary">{lease.leaseStatus}</Badge>
                    </div>
                    
                    <div className="space-y-1 text-sm text-gray-600">
                      <p>
                        <span className="font-medium">Property:</span> {lease.property.name || 'Unnamed Property'}
                      </p>
                      <p>
                        <span className="font-medium">Unit:</span> {lease.unit.unitNumber}
                      </p>
                      <p>
                        <span className="font-medium">Rent:</span> ${lease.rentAmount.toLocaleString()}/month
                      </p>
                      <p>
                        <span className="font-medium">Start Date:</span>{' '}
                        {new Date(lease.startDate).toLocaleDateString()}
                      </p>
                      <p>
                        <span className="font-medium">Email:</span> {lease.tenant.email}
                      </p>
                    </div>
                  </div>

                  <div className="ml-4">
                    <button
                      onClick={() => handleActivateLease(lease.id)}
                      className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors text-sm font-medium"
                    >
                      Activate Lease
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Refresh Button */}
        {leases.length > 0 && (
          <div className="mt-4 flex justify-end">
            <button
              onClick={fetchPendingLeases}
              className="px-4 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
            >
              Refresh
            </button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
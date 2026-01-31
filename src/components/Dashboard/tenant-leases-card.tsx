'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface Lease {
  id: string;
  property: {
    propertyName: string;
    address: string;
  };
  unit: {
    unitNumber: string;
  };
  rentAmount: number;
  startDate: string;
  endDate: string;
  leaseStatus: string;
}

interface Invoice {
  id: string;
  type: string;
  totalAmount: number;
  balance: number;
  amountPaid: number;
  status: string;
  dueDate: string;
  description?: string;
}

export function TenantLeasesCard() {
  const [leases, setLeases] = useState<Lease[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchTenantData();
  }, []);

  async function fetchTenantData() {
    try {
      setLoading(true);
      
      // Fetch active leases
      const leasesResponse = await fetch('/api/tenant/[id]/leases');
      const leasesData = await leasesResponse.json();
      
      // Fetch all invoices
      const invoicesResponse = await fetch('/api/tenant/[id]/invoices');
      const invoicesData = await invoicesResponse.json();

      if (leasesData.success) {
        setLeases(leasesData.leases || []);
      } else {
        setLeases([]);
      }

      if (invoicesData.success) {
        setInvoices(invoicesData.invoices || []);
      } else {
        setInvoices([]);
      }
      
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>My Leases</CardTitle>
          <CardDescription>Loading your lease information...</CardDescription>
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
          <CardTitle>My Leases</CardTitle>
          <CardDescription className="text-red-600">Error: {error}</CardDescription>
        </CardHeader>
        <CardContent>
          <button
            onClick={fetchTenantData}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Retry
          </button>
        </CardContent>
      </Card>
    );
  }

  // Calculate total balance across all invoices
  const totalBalance = invoices.reduce((sum, inv) => sum + Number(inv.balance), 0);

  return (
    <div className="space-y-6">
      
      {/* Total Balance Card */}
      <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
        <CardHeader>
          <CardTitle className="text-2xl">Total Balance Due</CardTitle>
          <CardDescription>Across all active leases</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-4xl font-bold text-blue-900">
            ${totalBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
          <p className="text-sm text-blue-600 mt-2">
            {invoices.filter(i => i.status === 'PENDING').length} pending invoice(s)
          </p>
        </CardContent>
      </Card>

      {/* Active Leases */}
      <Card>
        <CardHeader>
          <CardTitle>Active Leases</CardTitle>
          <CardDescription>
            {leases.length === 0 
              ? 'No active leases' 
              : `You have ${leases.length} active lease${leases.length === 1 ? '' : 's'}`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {leases.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>No active leases found</p>
            </div>
          ) : (
            <div className="space-y-4">
              {leases.map((lease) => {
                // Get invoices for this lease (simplified filtering by unit number)
                const leaseInvoices = invoices.filter(inv => 
                  inv.description?.includes(lease.unit.unitNumber)
                );
                const leaseBalance = leaseInvoices.reduce((sum, inv) => sum + Number(inv.balance), 0);

                return (
                  <div
                    key={lease.id}
                    className="p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-semibold text-lg">{lease.property.propertyName}</h3>
                        <p className="text-sm text-gray-600">{lease.property.address}</p>
                        <p className="text-sm text-gray-600">Unit {lease.unit.unitNumber}</p>
                      </div>
                      <Badge variant={lease.leaseStatus === 'ACTIVE' ? 'default' : 'secondary'}>
                        {lease.leaseStatus}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-gray-500">Monthly Rent</p>
                        <p className="font-semibold">${lease.rentAmount.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Balance Due</p>
                        <p className="font-semibold text-red-600">${leaseBalance.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Lease Start</p>
                        <p className="font-semibold">
                          {new Date(lease.startDate).toLocaleDateString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-500">Lease End</p>
                        <p className="font-semibold">
                          {new Date(lease.endDate).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Invoices */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Invoices</CardTitle>
          <CardDescription>All invoices across your leases</CardDescription>
        </CardHeader>
        <CardContent>
          {invoices.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>No invoices found</p>
            </div>
          ) : (
            <div className="space-y-3">
              {invoices.slice(0, 10).map((invoice) => (
                <div
                  key={invoice.id}
                  className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant={invoice.type === 'RENT' ? 'default' : 'secondary'}>
                        {invoice.type}
                      </Badge>
                      <Badge variant={
                        invoice.status === 'PAID' ? 'outline' : 
                        invoice.status === 'OVERDUE' ? 'destructive' : 'secondary'
                      }>
                        {invoice.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600">
                      {invoice.description || `${invoice.type} Invoice`}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Due: {new Date(invoice.dueDate).toLocaleDateString()}
                    </p>
                  </div>

                  <div className="text-right">
                    <p className="font-semibold text-lg">
                      ${invoice.balance.toLocaleString()}
                    </p>
                    <p className="text-xs text-gray-500">
                      of ${invoice.totalAmount.toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
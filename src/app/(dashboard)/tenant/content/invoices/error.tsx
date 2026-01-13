'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { AlertCircle, RefreshCcw } from 'lucide-react';

export default function TenantInvoiceError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Invoice Module Crash (Tenant):', error);
  }, [error]);

  return (
    <div className="h-[50vh] w-full flex flex-col items-center justify-center space-y-4 border-2 border-dashed border-blue-100 rounded-lg bg-blue-50/30 p-6">
      <div className="flex items-center space-x-3 text-blue-700">
        <AlertCircle className="h-8 w-8" />
        <h2 className="text-xl font-bold">Billing Service Unavailable</h2>
      </div>

      <p className="text-slate-600 text-center max-w-md">
        We're having trouble reaching the billing server at the moment. Your payment history and balances are safe.
      </p>

      <div className="flex gap-4">
        <Button
          variant="ghost"
          onClick={() => window.location.reload()}
          className="text-slate-500 hover:text-slate-700"
        >
          Reload Dashboard
        </Button>
        <Button
          onClick={() => reset()}
          className="bg-blue-600 hover:bg-blue-700 text-white"
        >
          <RefreshCcw className="mr-2 h-4 w-4" />
          Retry Now
        </Button>
      </div>

      <div className="mt-8 p-4 bg-white border border-blue-100 rounded-md shadow-sm">
        <p className="text-xs text-slate-500 text-center">
          Need to make a payment urgently? <br />
          Email us at <span className="text-blue-600 font-medium text-sm">support@rentflow360.com</span>
        </p>
      </div>
    </div>
  );
}
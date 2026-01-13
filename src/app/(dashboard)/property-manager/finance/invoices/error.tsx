'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { AlertCircle, RefreshCcw } from 'lucide-react';

export default function InvoiceError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Invoice Module Crash (PM):', error);
  }, [error]);

  return (
    <div className="h-[60vh] w-full flex flex-col items-center justify-center space-y-6 border-2 border-dashed border-red-200 rounded-xl bg-red-50/50 p-8 backdrop-blur-sm">
      <div className="bg-red-100 p-4 rounded-full">
        <AlertCircle className="h-10 w-10 text-red-600" />
      </div>

      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-gray-900">Invoices Temporarily Unavailable</h2>
        <p className="text-gray-600 max-w-md mx-auto">
          We encountered an issue while loading the financial dashboard. Rest assured, your data is secure.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 w-full max-w-sm">
        <Button
          variant="outline"
          className="flex-1 bg-white hover:bg-gray-50 border-gray-200"
          onClick={() => window.location.reload()}
        >
          Hard Refresh
        </Button>
        <button
          onClick={() => reset()}
          className="flex-1 inline-flex items-center justify-center px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-md transition-colors"
        >
          <RefreshCcw className="mr-2 h-4 w-4" />
          Try Again
        </button>
      </div>

      <div className="pt-6 border-t border-red-100 w-full text-center">
        <p className="text-sm text-gray-500">
          Persistent issue? Contact our administration support at <span className="font-semibold">admin@rentflow360.com</span>
        </p>
      </div>
    </div>
  );
}
'use client';

import { useEffect, useRef, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Lock, Eye, EyeOff } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const redirectTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (redirectTimeoutRef.current) {
        window.clearTimeout(redirectTimeoutRef.current);
      }
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!token) {
      toast.error('Invalid or missing reset token');
      return;
    }

    if (!password || !confirmPassword) {
      toast.error('Please fill in all fields');
      return;
    }

    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (password.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      });

      if (!response.ok) {
        let message = 'Failed to reset password';

        try {
          const err = (await response.json()) as { message?: string };
          if (err?.message) message = err.message;
        } catch {
          // Non-JSON error response; keep generic message
        }

        toast.error(message);
        setIsSubmitting(false);
        return;
      }

      toast.success('Password reset successfully! Redirecting to login...');

      // Keep loading state while redirecting
      redirectTimeoutRef.current = window.setTimeout(() => {
        router.replace('/login');
      }, 2000);
    } catch (error) {
      console.error('Reset password error:', error);
      toast.error('Something went wrong. Please try again.');
      setIsSubmitting(false);
    }
  };

  if (!token) {
    return (
      <div className="text-center text-red-700 bg-red-50 p-4 rounded-lg border border-red-200">
        <p className="mb-2">Invalid or missing reset token.</p>
        <Button
          type="button"
          variant="link"
          onClick={() => router.push('/forgot-password')}
          className="px-0"
        >
          Request a new one
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6" aria-busy={isSubmitting}>
      <div className="space-y-2">
        <label htmlFor="new-password" className="text-sm font-medium text-gray-700">
          New Password <span className="text-red-500">*</span>
        </label>

        <div className="relative">
          <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
            <Lock className="w-5 h-5" aria-hidden="true" />
          </div>

          <Input
            id="new-password"
            name="new-password"
            type={showPassword ? 'text' : 'password'}
            autoComplete="new-password"
            placeholder="Enter new password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={8}
            disabled={isSubmitting}
            className="h-12 pl-11 pr-10 text-base focus:border-blue-500 transition-colors"
          />

          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            disabled={isSubmitting}
            aria-label={showPassword ? 'Hide password' : 'Show password'}
            aria-pressed={showPassword}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 disabled:opacity-50"
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>

        <p className="text-xs text-gray-500">Must be at least 8 characters.</p>
      </div>

      <div className="space-y-2">
        <label htmlFor="confirm-password" className="text-sm font-medium text-gray-700">
          Confirm New Password <span className="text-red-500">*</span>
        </label>

        <div className="relative">
          <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
            <Lock className="w-5 h-5" aria-hidden="true" />
          </div>

          <Input
            id="confirm-password"
            name="confirm-password"
            type={showConfirmPassword ? 'text' : 'password'}
            autoComplete="new-password"
            placeholder="Confirm new password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            minLength={8}
            disabled={isSubmitting}
            className="h-12 pl-11 pr-10 text-base focus:border-blue-500 transition-colors"
          />

          <button
            type="button"
            onClick={() => setShowConfirmPassword((v) => !v)}
            disabled={isSubmitting}
            aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
            aria-pressed={showConfirmPassword}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 disabled:opacity-50"
          >
            {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
      </div>

      <Button
        type="submit"
        disabled={isSubmitting}
        className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white text-base font-semibold transition-all duration-300"
      >
        {isSubmitting ? 'Resetting...' : 'Reset Password'}
      </Button>
    </form>
  );
}

function ResetPasswordFallback() {
  return (
    <div className="text-center p-4 min-h-[120px] flex items-center justify-center" role="status" aria-live="polite">
      Loading...
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="w-full p-6 lg:p-8">
      <div className="text-center mb-8">
        <Lock className="w-6 h-6 text-blue-600 mx-auto mb-4" aria-hidden="true" />
        <h1 className="text-2xl font-semibold">Reset Password</h1>
        <p className="text-gray-600 text-sm lg:text-base">
          Enter your new password below.
        </p>
      </div>

      <Suspense fallback={<ResetPasswordFallback />}>
        <ResetPasswordForm />
      </Suspense>
    </div>
  );
}

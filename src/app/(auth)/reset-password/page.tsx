'use client';

import { useState, Suspense } from 'react';
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
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!token) {
      toast.error('Missing reset token');
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

      if (response.ok) {
        toast.success('Password reset successfully! Redirecting to login...');
        setTimeout(() => router.push('/login'), 3000);
      } else {
        const err = await response.json();
        toast.error(err.message || 'Failed to reset password');
      }
    } catch (error) {
      toast.error('Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!token) {
    return (
      <div className="text-center text-red-600 bg-red-50 p-4 rounded-lg">
        <p>Invalid or missing reset token.</p>
        <Button variant="link" onClick={() => router.push('/forgot-password')}>Request a new one</Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="relative">
        <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
          <Lock className="w-5 h-5" />
        </div>
        <Input
          type={showPassword ? "text" : "password"}
          placeholder="New Password *"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="h-12 pl-11 pr-10 text-base focus:border-blue-500 transition-colors"
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
        >
          {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      </div>

      <div className="relative">
        <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
          <Lock className="w-5 h-5" />
        </div>
        <Input
          type="password"
          placeholder="Confirm New Password *"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
          className="h-12 pl-11 pr-4 text-base focus:border-blue-500 transition-colors"
        />
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

export default function ResetPasswordPage() {
  return (
    <div className="w-full p-6 lg:p-8">
      <div className="text-center mb-8">
        <Lock className="w-6 h-6 text-blue-600 mx-auto mb-4" />
        <h1 className="text-2xl font-semibold">Reset Password</h1>
        <p className="text-gray-600 text-sm lg:text-base">
          Enter your new password below.
        </p>
      </div>

      <Suspense fallback={<div className="text-center p-4">Loading...</div>}>
        <ResetPasswordForm />
      </Suspense>
    </div>
  );
}
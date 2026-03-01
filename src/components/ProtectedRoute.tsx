'use client'
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
    children: React.ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
    const { user, isLoading, refreshUser } = useAuth();
    const router = useRouter();
    const [hasCheckedAuth, setHasCheckedAuth] = useState(false);

    useEffect(() => {
        // Try to refresh user from /api/auth/me if not loaded from localStorage
        const checkAuth = async () => {
            if (isLoading) return;

            if (!user) {
                // Attempt to restore user from server
                try {
                    await refreshUser();
                } catch (error) {
                    console.error('Failed to refresh user:', error);
                    // If refresh fails, redirect to login
                    router.push('/login');
                }
            }
            setHasCheckedAuth(true);
        };

        checkAuth();
    }, [isLoading, user, refreshUser, router]);

    if (isLoading || !hasCheckedAuth) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                    <p className="text-gray-600">Loading...</p>
                </div>
            </div>
        );
    }

    if (!user) {
        return null;
    }

    return <>{children}</>;
}
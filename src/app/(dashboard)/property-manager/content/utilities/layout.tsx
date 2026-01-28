"use client";

/**
 * Utilities Layout Shell
 * 
 * Provides consistent container spacing.
 * Navigation is handled by the primary Sidebar.
 */
export default function UtilitiesLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="min-h-screen bg-slate-50/50">
            <div className="max-w-7xl mx-auto px-6 py-8">
                {children}
            </div>
        </div>
    );
}

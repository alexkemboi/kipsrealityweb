/**
 * Resilient API Utilities for the Invoicing Module
 */

/**
 * Fetches invoices with graceful error handling and cache control.
 * Used to prevent white-screen crashes when the database or API is unreachable.
 */
export async function getInvoicesSafe(url: string) {
    try {
        const res = await fetch(url, {
            next: { revalidate: 0 }, // Ensure financial data is always fresh
            headers: {
                'Accept': 'application/json',
            },
        });

        if (!res.ok) {
            // If 404, return empty array/object instead of crashing
            if (res.status === 404) {
                console.warn(`Resource not found at ${url}. Returning empty fallback.`);
                return [];
            }

            // If unauthorized, the middleware should handle it, 
            // but we throw to trigger the error boundary if they get past.
            throw new Error(`Invoices Unavailable (Status: ${res.status})`);
        }

        const data = await res.json();
        return data;
    } catch (error) {
        console.error("Critical Invoice Fetch Error:", error);
        // Re-throw to be caught by Next.js Error Boundary (error.tsx)
        throw error;
    }
}

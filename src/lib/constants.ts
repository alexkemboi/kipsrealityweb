// src/lib/constants.ts

export const APP_NAME = "RentFlow360";
export const SUPPORT_EMAIL = process.env.SMTP_USER || "info@rentflow360.com";

/**
 * Determines the correct base URL for links (Verification, Reset Password).
 * Prioritizes Production Env -> Vercel Env -> Localhost.
 */
export const getBaseUrl = () => {
    if (process.env.NEXT_PUBLIC_APP_URL) {
        return process.env.NEXT_PUBLIC_APP_URL;
    }

    // If you deploy to Vercel, this is automatically set
    if (process.env.VERCEL_URL) {
        return `https://${process.env.VERCEL_URL}`;
    }

    // Fallback for local development
    return "http://localhost:3000";
};
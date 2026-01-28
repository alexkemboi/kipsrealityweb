// src/lib/constants.ts

export const APP_NAME = "RentFlow360";
export const SUPPORT_EMAIL = process.env.SMTP_USER || "Info@rentflow360.com";

/**
 * Determines the correct base URL for links (Verification, Reset Password).
 * Prioritizes Production Env -> Vercel Env -> Localhost.
 */
export const getBaseUrl = () => {
    // 1. Check the specific APP_URL env var first
    if (process.env.NEXT_PUBLIC_APP_URL) {
        return process.env.NEXT_PUBLIC_APP_URL;
    }

    // 2. Check the generic BASE_URL (since you have both in your .env)
    if (process.env.NEXT_PUBLIC_BASE_URL) {
        return process.env.NEXT_PUBLIC_BASE_URL;
    }

    // 3. Fallback (Only for local dev if envs are missing)
    return "http://localhost:3000";
};
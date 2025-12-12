export const APP_NAME = "RentFlow360";
export const SUPPORT_EMAIL = "support@rentflow360.com";
export const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";


if (typeof window === 'undefined' && !process.env.RESEND_API_KEY) {
    console.warn("⚠️ WARNING: RESEND_API_KEY is missing. Emails will be logged to console only.");
}

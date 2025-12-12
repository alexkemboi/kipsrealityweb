import { Resend } from 'resend';
import React from 'react';

// 1. SAFE INITIALIZATION (The Fix)
// If the key is missing, we set resend to null instead of crashing the app.
const resend = process.env.RESEND_API_KEY
    ? new Resend(process.env.RESEND_API_KEY)
    : null;

interface SendEmailOptions {
    to: string;
    subject: string;
    text?: string;
    react?: React.ReactElement;
}

export const sendEmail = async ({ to, subject, text, react }: SendEmailOptions) => {
    // 2. CHECK BEFORE SENDING
    // If resend is null (key missing), we fallback to console logging.
    if (!resend) {
        console.log("=================================================");
        console.log("⚠️ RESEND_API_KEY is missing in .env");
        console.log("📧 MOCK EMAIL LOG:");
        console.log(`To: ${to}`);
        console.log(`Subject: ${subject}`);
        if (text) console.log(`Body: ${text}`);
        console.log("=================================================");
        return;
    }

    try {
        const data = await resend.emails.send({
            from: process.env.EMAIL_FROM_ADDRESS || 'onboarding@resend.dev',
            to,
            subject,
            text, // Fallback text
            react,
        });

        // Check for Resend specific error structure
        if (data.error) {
            throw new Error(data.error.message);
        }

        console.log(`✅ Email sent to ${to}`);
    } catch (error) {
        // 3. THE GOTCHA FIX: Graceful Fallback
        console.error("❌ Email sending failed (likely Resend Sandbox restriction).");
        console.error("---------------------------------------------------");
        console.error(`Intent: Send to ${to}`);
        console.error(`Subject: ${subject}`);

        // If it's a link-based email (verification/reset), the URL is usually inside the 'react' prop.
        // Since we can't easily extract it here, relying on the Route Handler's logs is key.
        console.error("See the ROUTE HANDLER logs above for the actual clickable link.");
        console.error("---------------------------------------------------");

        // We do NOT re-throw the error. We let the code proceed so the UI doesn't break.
    }
};
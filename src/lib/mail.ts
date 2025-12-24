// src/lib/mail.ts
import nodemailer from 'nodemailer';
import { render } from '@react-email/render';
import React from 'react';

// 1. Initialize SMTP Transporter
const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
    },
});

interface SendEmailOptions {
    to: string;
    subject: string;
    react?: React.ReactElement; // We still accept React components!
    text?: string;              // Fallback plain text
}

export const sendEmail = async ({ to, subject, react, text }: SendEmailOptions) => {
    // Safety Check: If creds are missing, don't crash, just log.
    if (!process.env.SMTP_USER || !process.env.SMTP_PASSWORD) {
        console.warn("⚠️ SMTP credentials missing. Logging email to console.");
        console.log(`To: ${to}\nSubject: ${subject}`);
        return;
    }

    try {
        // 2. Convert React Component to HTML String
        // Using @react-email/render which is compatible with Next.js API routes
        const htmlBody = react ? await render(react) : undefined;

        // 3. Send via Nodemailer
        const info = await transporter.sendMail({
            from: `"${process.env.EMAIL_FROM_NAME}" <${process.env.SMTP_USER}>`,
            to,
            subject,
            html: htmlBody,
            text: text || "Please enable HTML to view this email.", // Fallback if no text provided
        });

        console.log(`✅ Email sent to ${to} | MessageID: ${info.messageId}`);
    } catch (error) {
        console.error("❌ SMTP Email sending failed:", error);
        // We log but don't throw, to keep the auth flow alive.
    }
};
// src/lib/mail.ts
import nodemailer from 'nodemailer';
import { render } from '@react-email/render';
import React from 'react';

const DEFAULT_SMTP_TIMEOUT_MS = 10_000;
const MIN_SMTP_TIMEOUT_MS = 1_000;
const MAX_SMTP_TIMEOUT_MS = 60_000;

function getSmtpTimeoutMs() {
    const raw = Number(process.env.SMTP_TIMEOUT_MS);
    if (!Number.isFinite(raw)) {
        return DEFAULT_SMTP_TIMEOUT_MS;
    }

    return Math.min(MAX_SMTP_TIMEOUT_MS, Math.max(MIN_SMTP_TIMEOUT_MS, Math.floor(raw)));
}

export function getMissingSmtpEnvVars() {
    const required = ['SMTP_HOST', 'SMTP_PORT', 'SMTP_USER', 'SMTP_PASSWORD'];
    return required.filter((key) => !process.env[key]);
}

export function isSmtpConfigured() {
    return getMissingSmtpEnvVars().length === 0;
}

function createTransporter() {
    const timeoutMs = getSmtpTimeoutMs();

    return nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT),
        secure: process.env.SMTP_SECURE === 'true',
        connectionTimeout: timeoutMs,
        greetingTimeout: timeoutMs,
        socketTimeout: timeoutMs,
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASSWORD,
        },
    });
}

export async function verifySmtpConnection() {
    const missingSmtpVars = getMissingSmtpEnvVars();
    if (missingSmtpVars.length > 0) {
        return {
            ok: false,
            missingSmtpVars,
            message: `SMTP is not configured. Missing: ${missingSmtpVars.join(', ')}`,
        };
    }

    try {
        const transporter = createTransporter();
        await transporter.verify();
        return {
            ok: true,
            missingSmtpVars: [] as string[],
            message: 'SMTP connection verified.',
        };
    } catch (error) {
        return {
            ok: false,
            missingSmtpVars: [] as string[],
            message: 'SMTP connection failed.',
            error: error instanceof Error ? error.message : 'Unknown SMTP error',
        };
    }
}

interface SendEmailOptions {
    to: string;
    subject: string;
    react?: React.ReactElement; // We still accept React components!
    text?: string;              // Fallback plain text
    html?: string;              // Optional raw HTML
}

export const sendEmail = async ({ to, subject, react, text, html }: SendEmailOptions) => {
    const missingSmtpVars = getMissingSmtpEnvVars();
    if (missingSmtpVars.length > 0) {
        const message = `SMTP is not configured. Missing: ${missingSmtpVars.join(', ')}`;

        // Fail fast in production so deployments cannot silently skip transactional email.
        if (process.env.NODE_ENV === 'production') {
            throw new Error(message);
        }

        console.warn(`⚠️ ${message}. Logging email payload in non-production.`);
        console.log(`To: ${to}\nSubject: ${subject}`);
        return;
    }

    try {
        // 2. Convert React Component to HTML String
        // Using @react-email/render which is compatible with Next.js API routes
        const htmlBody = react ? await render(react) : html;

        // 3. Send via Nodemailer
        const transporter = createTransporter();
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

import React from 'react';
import { sendEmail } from "./mail";
import { APP_NAME, BASE_URL } from "./constants";
import { prisma } from "./db";

/**
 * @deprecated Use sendNotification({ template: 'PASSWORD_RESET' }) instead.
 */
export const sendPasswordResetEmail = async (email: string, token: string) => {
    // 1. We need to find the ID because the new system works on IDs
    const user = await prisma.user.findUnique({ where: { email } });

    if (user) {
        const resetUrl = `${BASE_URL}/reset-password?token=${token}`;

        // 2. Delegate to the new system (Enforces Consent & centralized logic)
        await sendNotification({
            userId: user.id,
            template: 'PASSWORD_RESET',
            data: { url: resetUrl }
        });
    }
};

/**
 * @deprecated Use sendNotification({ template: 'VERIFY_EMAIL' }) instead.
 */
export const sendVerificationEmail = async (email: string, token: string) => {
    const user = await prisma.user.findUnique({ where: { email } });

    if (user) {
        const verifyUrl = `${BASE_URL}/api/auth/verify-email?token=${token}`;

        await sendNotification({
            userId: user.id,
            template: 'VERIFY_EMAIL',
            data: { url: verifyUrl }
        });
    }
};

// -- New Template-Driven Notification System --

export type EmailCategory = 'transactional' | 'notifications' | 'marketing';

interface NotificationOptions {
    userId: string;
    template: 'WELCOME' | 'VERIFY_EMAIL' | 'PASSWORD_RESET' | 'BILLING_NOTICE' | 'MAINTENANCE_UPDATE';
    data: Record<string, any>;
}

export const sendNotification = async ({ userId, template, data }: NotificationOptions) => {
    // 1. Fetch User Data & Consents
    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { email: true, firstName: true, consentTransactional: true, consentNotifications: true, consentMarketing: true }
    });

    if (!user) return;

    // 2. Map Template to Category & Subject
    let category: EmailCategory = 'notifications';
    let subject = "";
    let body: React.ReactElement = <div></div>;

    switch (template) {
        case 'VERIFY_EMAIL':
            category = 'transactional';
            subject = "Verify your RentFlow360 Account";
            body = (
                <div>
                    <h1>Hi {user.firstName}</h1>
                    <p>Click here to verify: {data.url}</p>
                </div>
            );
            break;

        case 'PASSWORD_RESET':
            category = 'transactional';
            subject = "Reset your Password";
            body = (
                <div>
                    <p>Your reset link: {data.url}</p>
                </div>
            );
            break;

        case 'BILLING_NOTICE':
            category = 'notifications'; // User can opt-out of this
            subject = `Invoice Due: ${data.invoiceId}`;
            body = (
                <div>
                    <p>Amount due: {data.amount}</p>
                    <a href={data.url}>Pay Now</a>
                </div>
            );
            break;

        case 'MAINTENANCE_UPDATE':
            category = 'notifications';
            subject = "System Maintenance Update";
            body = (
                <div>
                    <h1>Maintenance Scheduled</h1>
                    <p>{data.message || "We will be performing scheduled maintenance."}</p>
                </div>
            );
            break;

        case 'WELCOME':
            category = 'marketing'; // Categorized as marketing/onboarding to enable 'marketing' path
            subject = `Welcome to ${APP_NAME}!`;
            body = (
                <div>
                    <h1>Welcome, {user.firstName}!</h1>
                    <p>We're excited to have you on board.</p>
                </div>
            );
            break;
    }

    // 3. Consent Check logic
    const hasConsent =
        (category === 'transactional' && user.consentTransactional) ||
        (category === 'notifications' && user.consentNotifications) ||
        (category === 'marketing' && user.consentMarketing);

    if (!hasConsent) {
        console.log(`[Mail] User ${userId} has opted out of ${category} emails.`);
        return;
    }

    // 4. Dispatch
    await sendEmail({
        to: user.email,
        subject: subject,
        react: body,
    });
};

// src/lib/mail-service.tsx
import { sendEmail } from "./mail";
import { APP_NAME, getBaseUrl } from "./constants";

/**
 * 1. Password Reset Wrapper
 */
export const sendPasswordResetEmail = async (email: string, token: string) => {
    // Dynamic URL based on environment
    const resetUrl = `${getBaseUrl()}/reset-password?token=${token}`;

    const emailBody = (
        <div style={{ fontFamily: 'Arial, sans-serif', padding: '20px', color: '#333' }}>
            <h1>Reset your password for {APP_NAME}</h1>
            <p>Someone requested a password reset for your account.</p>
            <p>Click the link below to reset it. This link expires in 1 hour.</p>
            <a
                href={resetUrl}
                style={{
                    display: 'inline-block',
                    padding: '10px 20px',
                    backgroundColor: '#007bff',
                    color: '#ffffff',
                    textDecoration: 'none',
                    borderRadius: '5px',
                    marginTop: '10px'
                }}
            >
                Reset Password
            </a>
            <p style={{ marginTop: '20px', fontSize: '12px', color: '#666' }}>
                If you did not request this, please ignore this email.
            </p>
        </div>
    );

    await sendEmail({
        to: email,
        subject: `Reset your ${APP_NAME} password`,
        react: emailBody,
    });
};

/**
 * 2. Verification Wrapper
 */
export const sendVerificationEmail = async (email: string, token: string) => {
    // 1. Get the Base URL dynamically
    const baseUrl = getBaseUrl();

    // 2. Construct the full link
    const verifyUrl = `${baseUrl}/api/auth/verify-email?token=${token}`;

    // 🔍 DEBUG LOG: Check this in your VS Code terminal when you sign up
    console.log("-------------------------------------------------------");
    console.log("🔗 GENERATED VERIFICATION LINK:", verifyUrl);
    console.log("-------------------------------------------------------");

    const emailBody = (
        <div style={{ fontFamily: 'Arial, sans-serif', padding: '20px', color: '#333' }}>
            <h1>Welcome to {APP_NAME}!</h1>
            <p>Thank you for signing up. Please verify your email address to activate your account.</p>
            <a
                href={verifyUrl}
                style={{
                    display: 'inline-block',
                    padding: '10px 20px',
                    backgroundColor: '#28a745',
                    color: '#ffffff',
                    textDecoration: 'none',
                    borderRadius: '5px',
                    marginTop: '10px'
                }}
            >
                Verify Email
            </a>
        </div>
    );

    await sendEmail({
        to: email,
        subject: `Welcome to ${APP_NAME} - Verify your email`,
        react: emailBody,
    });
};

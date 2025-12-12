import { sendEmail } from "./mail";
import { APP_NAME, BASE_URL } from "./constants";
// Import your templates (we will create these next)
// import WelcomeEmail from "@/emails/WelcomeEmail";
// import ResetPasswordEmail from "@/emails/ResetPasswordEmail";

/**
 * 1. Password Reset Wrapper
 */
export const sendPasswordResetEmail = async (email: string, token: string) => {
    const resetUrl = `${BASE_URL}/reset-password?token=${token}`;

    console.log("---------------------------------------------------");
    console.log("🔐 Password Reset Link (Dev):", resetUrl);
    console.log("---------------------------------------------------");

    // Simple HTML for now, replace with React Component later
    const simpleBody = (
        <div>
            <h1>Reset your password for {APP_NAME}</h1>
            <p>Click the link below to reset your password. This link expires in 1 hour.</p>
            <a href={resetUrl}>Reset Password</a>
        </div>
    );

    await sendEmail({
        to: email,
        subject: "Reset your password",
        react: simpleBody, // Later: <ResetPasswordEmail url={resetUrl} />
    });
};

/**
 * 2. Verification Wrapper
 */
export const sendVerificationEmail = async (email: string, token: string) => {
    const verifyUrl = `${BASE_URL}/api/auth/verify-email?token=${token}`;

    console.log("---------------------------------------------------");
    console.log("📧 Verification Link (Dev):", verifyUrl);
    console.log("---------------------------------------------------");

    const simpleBody = (
        <div>
            <h1>Welcome to {APP_NAME}!</h1>
            <p>Please verify your email address by clicking the link below:</p>
            <a href={verifyUrl}>Verify Email</a>
        </div>
    );

    await sendEmail({
        to: email,
        subject: "Verify your email",
        react: simpleBody,
    });
};

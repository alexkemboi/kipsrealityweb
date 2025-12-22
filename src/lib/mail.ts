import nodemailer from 'nodemailer';
import { render } from '@react-email/render';

interface SendEmailOptions {
    to: string;
    subject: string;
    react?: React.ReactElement;
    text?: string;
}

export const sendEmail = async ({ to, subject, react, text }: SendEmailOptions) => {
    // 1. Configure SMTP Transporter (Generic)
    const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT),
        secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASSWORD,
        },
    });

    try {
        // 2. Render React to HTML
        const html = react ? await render(react) : undefined;
        const plainText = text || (html ? html.replace(/<[^>]+>/g, '') : '');

        // 3. Send
        const info = await transporter.sendMail({
            from: `"${process.env.EMAIL_FROM_NAME}" <${process.env.SMTP_USER}>`,
            to,
            subject,
            text: plainText,
            html,
        });

        console.log(`✅ Email sent to ${to} | Message ID: ${info.messageId}`);
    } catch (error) {
        console.error("❌ SMTP Sending Failed:", error);
    }
};
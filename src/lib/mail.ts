import nodemailer from 'nodemailer';
import { render } from '@react-email/render';

interface SendEmailOptions {
    to: string;
    subject: string;
    react?: React.ReactElement;
    text?: string;
}

export const sendEmail = async ({ to, subject, react, text }: SendEmailOptions) => {
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.GMAIL_USER,
            pass: process.env.GMAIL_APP_PASSWORD,
        },
    });

    try {
        // 1. Generate HTML
        const html = react ? await render(react) : undefined;

        // 2. Generate Plain Text Fallback (Crucial for Spam Filters)
        // If 'text' wasn't provided, strip HTML tags to create it
        const plainText = text || (html ? html.replace(/<[^>]+>/g, '') : '');

        const info = await transporter.sendMail({
            from: `"RentFlow360 Support" <${process.env.GMAIL_USER}>`,
            to,
            subject,
            text: plainText, // Spam filters love this
            html,
        });

        console.log(`✅ Email sent to ${to} | Message ID: ${info.messageId}`);
    } catch (error) {
        console.error("❌ Gmail Sending Failed:", error);
    }
};
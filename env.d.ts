/// <reference types="next" />
/// <reference types="next/image-types/global" />

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      DATABASE_URL: string;
      JWT_SECRET: string;
      JWT_REFRESH_SECRET: string;
      NEXTAUTH_SECRET: string;
      CRON_SECRET: string;
      SMTP_HOST: string;
      SMTP_PORT: string;
      SMTP_SECURE: string;
      SMTP_USER: string;
      SMTP_PASSWORD: string;
      EMAIL_FROM_NAME: string;
      NEXT_PUBLIC_APP_URL: string;
      NEXT_PUBLIC_BASE_URL?: string;
      UPLOADTHING_SECRET: string;
      UPLOADTHING_TOKEN: string;
      NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME: string;
      CLOUDINARY_API_KEY: string;
      CLOUDINARY_API_SECRET: string;
      SSN_ENCRYPTION_KEY: string;
      TWILIO_ACCOUNT_SID: string;
      TWILIO_AUTH_TOKEN: string;
      TWILIO_PHONE_NUMBER: string;
      PAYMENT_ENCRYPTION_KEY: string;
      PAYMENT_ENCRYPTION_KEY_METADATA: string;
      PAYMENT_ENCRYPTION_KEY_USER_INFO: string;
      PAYMENT_ENCRYPTION_KEY_TRANSACTION: string;
      PAYMENT_ENCRYPTION_KEY_WEBHOOK: string;
      STRIPE_SECRET_KEY: string;
      STRIPE_WEBHOOK_SECRET: string;
      NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: string;
      STRIPE_CONNECT_CLIENT_ID?: string;
      PLAID_CLIENT_ID: string;
      PLAID_SECRET: string;
      PLAID_ENV: string;
      PAYSTACK_SECRET_KEY: string;
      PAYSTACK_WEBHOOK_SECRET: string;
      NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY: string;
      MPESA_CONSUMER_KEY: string;
      MPESA_CONSUMER_SECRET: string;
      MPESA_PASSKEY: string;
      MPESA_SHORTCODE: string;
      MPESA_ENV: string;
      USE_MPESA_DIRECT: string;
      BACKUP_DIR?: string;
      NEXT_PUBLIC_API_URL?: string;
      NEXTAUTH_URL?: string;
      VERCEL_URL?: string;
      NEXT_PUBLIC_VERCEL_URL?: string;
      ADMIN_EMAIL?: string;
      E2E?: string;
      CI?: string;
      NODE_ENV: "development" | "production" | "test";
    }
  }
}

export {};

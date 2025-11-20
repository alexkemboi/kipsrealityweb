// lib/email.ts
interface EmailOptions {
  to: string;
  subject: string;
  body: string;
}

export async function sendEmail({ to, subject, body }: EmailOptions) {
  // For now, just log the email instead of sending
  console.log("📧 Sending email:");
  console.log(`To: ${to}`);
  console.log(`Subject: ${subject}`);
  console.log(`Body: ${body}`);
  
  // Simulate a short delay
  await new Promise((resolve) => setTimeout(resolve, 100));
}


interface EmailOptions {
  to: string;
  subject: string;
  text?: string;
  html?: string;
}

export async function sendEmail({ to, subject, text, html }: EmailOptions) {
  // TODO: Integrate with a real email provider like Resend, SendGrid, or Nodemailer
  // Example with Resend:
  // await resend.emails.send({ from: 'onboarding@resend.dev', to, subject, html: html || text });

  console.log(`[Email Service] Sending email to ${to}`);
  console.log(`[Email Service] Subject: ${subject}`);
  if (text) console.log(`[Email Service] Text: ${text}`);
  if (html) console.log(`[Email Service] HTML: (Content hidden for brevity)`);

  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 500));

  return { success: true };
}

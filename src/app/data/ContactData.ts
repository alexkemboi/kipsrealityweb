import { z } from "zod";


export const contactSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters long"),
  email: z.string().email("Please enter a valid email address"),
  countryCode: z.string().min(1, "Select your country code"),
  phone: z
    .string()
    .trim()
    .regex(/^\d{6,15}$/, "Enter a valid phone number (digits only)"),
  message: z.string().min(5, "Message must be at least 5 characters long"),
});

export type ContactData = z.infer<typeof contactSchema>;
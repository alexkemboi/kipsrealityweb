import { prisma } from "@/lib/db";
import crypto from "crypto";

// Generate a 6-digit numeric code
export function generateOtpCode(): string {
  return crypto.randomInt(100000, 999999).toString();
}

// Save OTP to DB
export async function createOtp(userId: string, phone: string, type: 'TWO_FACTOR' | 'PHONE_VERIFICATION') {
  // 1. Delete old OTPs for this user to prevent clutter
  await prisma.otp.deleteMany({
    where: { userId, type }
  });

  // 2. Generate new
  const code = generateOtpCode();
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

  // 3. Save
  await prisma.otp.create({
    data: {
      userId,
      phone,
      code,
      type,
      expiresAt
    }
  });

  return code;
}

// Verify OTP
export async function verifyOtp(userId: string, code: string, type: 'TWO_FACTOR' | 'PHONE_VERIFICATION') {
  const otpRecord = await prisma.otp.findFirst({
    where: {
      userId,
      code,
      type,
      expiresAt: { gt: new Date() } // Must not be expired
    }
  });

  if (!otpRecord) return false;

  // Cleanup used OTP
  await prisma.otp.delete({ where: { id: otpRecord.id } });
  
  return true;
}
// app/api/auth/invites/accept/route.ts
// Generic invite acceptance route (tenant/vendor/admin etc.)

import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import bcrypt from "bcryptjs";
import { z } from "zod";

const acceptInviteSchema = z.object({
  email: z.string().email(),
  token: z.string().min(1, "Invite token is required"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  firstName: z.string().min(1, "First name is required").max(100),
  lastName: z.string().optional().nullable(),
  phone: z.string().optional().nullable(),
  companyName: z.string().optional().nullable(),
  serviceType: z.string().optional().nullable(),
});

function normalizeString(value?: string | null) {
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  return trimmed.length ? trimmed : undefined;
}

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

function isRetryableTransactionError(error: unknown): boolean {
  if (!(error instanceof Error)) return false;
  const msg = error.message.toLowerCase();

  return (
    msg.includes("transaction not found") ||
    msg.includes("p2028") ||
    msg.includes("timeout") ||
    msg.includes("connection") ||
    msg.includes("deadlock")
  );
}

function isPrismaKnownError(error: unknown): error is Prisma.PrismaClientKnownRequestError {
  return error instanceof Prisma.PrismaClientKnownRequestError;
}

async function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function POST(request: Request) {
  try {
    const rawBody = await request.json();

    const parsed = acceptInviteSchema.safeParse(rawBody);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Invalid request body" },
        { status: 400 }
      );
    }

    const email = normalizeEmail(parsed.data.email);
    const token = parsed.data.token.trim();
    const password = parsed.data.password;
    const firstName = parsed.data.firstName.trim();
    const lastName = normalizeString(parsed.data.lastName ?? undefined);
    const phone = normalizeString(parsed.data.phone ?? undefined);
    const companyName = normalizeString(parsed.data.companyName ?? undefined);
    const serviceType = normalizeString(parsed.data.serviceType ?? undefined);

    // Hash outside the transaction for performance
    const hashedPassword = await bcrypt.hash(password, 12);

    const maxRetries = 3;
    let lastError: unknown = null;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const result = await prisma.$transaction(
          async (tx) => {
            const now = new Date();

            // 1) Find invite by token INSIDE transaction (safer under concurrency)
            const invite = await tx.invite.findUnique({
              where: { token },
              select: {
                id: true,
                email: true,
                accepted: true,
                expiresAt: true,
                organizationId: true,
                role: true,
                leaseId: true,
              },
            });

            if (!invite) {
              return {
                ok: false as const,
                status: 400,
                error: "Invalid or expired invite",
              };
            }

            const inviteEmail = normalizeEmail(invite.email);

            if (inviteEmail !== email) {
              return {
                ok: false as const,
                status: 400,
                error: "Invite email does not match",
              };
            }

            if (invite.accepted) {
              return {
                ok: false as const,
                status: 400,
                error: "Invite already used",
              };
            }

            if (invite.expiresAt < now) {
              return {
                ok: false as const,
                status: 400,
                error: "Invite has expired",
              };
            }

            // Vendor-specific validation
            if (invite.role === "VENDOR" && (!companyName || !serviceType)) {
              return {
                ok: false as const,
                status: 400,
                error: "Company name and service type are required for vendor invites",
              };
            }

            /**
             * 2) Claim invite atomically (race-condition resistant)
             * Only one concurrent request can flip accepted:false -> true.
             * If later steps fail, the whole transaction rolls back.
             */
            const claim = await tx.invite.updateMany({
              where: {
                id: invite.id,
                accepted: false,
                expiresAt: { gte: now },
                email: invite.email, // keep strict consistency with original record casing
              },
              data: { accepted: true },
            });

            if (claim.count !== 1) {
              return {
                ok: false as const,
                status: 409,
                error: "Invite was already accepted or is no longer valid",
              };
            }

            // 3) Create or update user
            const existingUser = await tx.user.findUnique({
              where: { email },
              select: {
                id: true,
                email: true,
                passwordHash: true,
                firstName: true,
                lastName: true,
                phone: true,
                status: true,
              },
            });

            let userRecord;

            if (existingUser) {
              // Safer behavior:
              // - update profile data
              // - set password (invite onboarding flow)
              // - reactivate account and verify email
              userRecord = await tx.user.update({
                where: { id: existingUser.id },
                data: {
                  passwordHash: hashedPassword,
                  firstName,
                  lastName,
                  phone,
                  status: "ACTIVE",
                  emailVerified: new Date(),
                },
                select: {
                  id: true,
                  email: true,
                  firstName: true,
                  lastName: true,
                  phone: true,
                },
              });
            } else {
              userRecord = await tx.user.create({
                data: {
                  email,
                  passwordHash: hashedPassword,
                  firstName,
                  lastName,
                  phone,
                  status: "ACTIVE",
                  emailVerified: new Date(),
                },
                select: {
                  id: true,
                  email: true,
                  firstName: true,
                  lastName: true,
                  phone: true,
                },
              });
            }

            // 4) Link user to organization (idempotent-ish)
            const existingOrgUser = await tx.organizationUser.findFirst({
              where: {
                userId: userRecord.id,
                organizationId: invite.organizationId,
              },
              select: { id: true, role: true },
            });

            if (!existingOrgUser) {
              await tx.organizationUser.create({
                data: {
                  userId: userRecord.id,
                  organizationId: invite.organizationId,
                  role: invite.role,
                },
              });
            }

            // 5) Link tenant to lease if this invite is tied to a lease
            if (invite.leaseId) {
              // Optional safety: don't overwrite another tenant silently
              const leaseUpdate = await tx.lease.updateMany({
                where: {
                  id: invite.leaseId,
                  OR: [{ tenantId: null }, { tenantId: userRecord.id }],
                },
                data: { tenantId: userRecord.id },
              });

              if (leaseUpdate.count !== 1) {
                // Throw so transaction rolls back (including invite accepted flag)
                throw new Error("Lease is already assigned to a different tenant");
              }
            }

            // 6) Create or update vendor profile if vendor invite
            if (invite.role === "VENDOR" && companyName && serviceType) {
              const existingVendor = await tx.vendor.findFirst({
                where: {
                  userId: userRecord.id,
                  organizationId: invite.organizationId,
                },
                select: { id: true },
              });

              if (existingVendor) {
                await tx.vendor.update({
                  where: { id: existingVendor.id },
                  data: {
                    companyName,
                    serviceType,
                    phone: phone ?? null,
                    email,
                    isActive: true,
                  },
                });
              } else {
                await tx.vendor.create({
                  data: {
                    userId: userRecord.id,
                    organizationId: invite.organizationId,
                    companyName,
                    serviceType,
                    phone: phone ?? null,
                    email,
                    isActive: true,
                  },
                });
              }
            }

            return {
              ok: true as const,
              inviteRole: invite.role,
              user: userRecord,
            };
          },
          {
            maxWait: 5000,
            timeout: 10000,
          }
        );

        // Business-validation result (not exception)
        if (!result.ok) {
          return NextResponse.json({ error: result.error }, { status: result.status });
        }

        return NextResponse.json(
          {
            success: true,
            message:
              result.inviteRole === "VENDOR"
                ? "Vendor account created successfully. You may now log in."
                : "Invite accepted. Account created successfully.",
            user: result.user,
          },
          { status: 200 }
        );
      } catch (error) {
        lastError = error;
        console.error(`Accept invite transaction attempt ${attempt} failed:`, error);

        // Handle known Prisma unique conflicts gracefully (e.g., concurrent org link/vendor create)
        if (isPrismaKnownError(error)) {
          if (error.code === "P2002") {
            return NextResponse.json(
              {
                error:
                  "This invite may have already been processed. Try logging in or request a new invite.",
              },
              { status: 409 }
            );
          }
        }

        if (attempt < maxRetries && isRetryableTransactionError(error)) {
          const delayMs = 200 * Math.pow(2, attempt - 1); // 200, 400, 800
          await sleep(delayMs);
          continue;
        }

        // Useful user-facing message for lease conflict
        if (error instanceof Error && error.message.includes("Lease is already assigned")) {
          return NextResponse.json(
            { error: "This lease is already linked to another tenant. Please contact support." },
            { status: 409 }
          );
        }

        break;
      }
    }

    console.error("All accept-invite transaction attempts failed:", lastError);
    return NextResponse.json(
      { error: "Failed to process invite. Please try again or contact support." },
      { status: 500 }
    );
  } catch (error) {
    console.error("Accept invite error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

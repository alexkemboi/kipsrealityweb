import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

function toPositiveInt(value: string | null, fallback: number) {
  const n = Number(value);
  if (!Number.isFinite(n) || n < 0) return fallback;
  return Math.floor(n);
}

function toDate(value: string | null): Date | undefined {
  if (!value) return undefined;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? undefined : d;
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    const limit = Math.min(toPositiveInt(searchParams.get("limit"), 20), 100);
    const offset = toPositiveInt(searchParams.get("offset"), 0);

    const listingId = searchParams.get("listingId")?.trim() || undefined;
    const unitId = searchParams.get("unitId")?.trim() || undefined;
    const userId = searchParams.get("userId")?.trim() || undefined;
    const action = searchParams.get("action")?.trim() || undefined;
    const status = searchParams.get("status")?.trim() || undefined;

    const dateFrom = toDate(searchParams.get("dateFrom"));
    const dateTo = toDate(searchParams.get("dateTo"));

    const where: Record<string, unknown> = {};

    if (listingId) where.listingId = listingId;
    if (unitId) where.unitId = unitId;
    if (userId) where.userId = userId;
    if (action) where.action = action;
    if (status) where.status = status;

    if (dateFrom || dateTo) {
      where.createdAt = {
        ...(dateFrom ? { gte: dateFrom } : {}),
        ...(dateTo ? { lte: dateTo } : {}),
      };
    }

    // Adjust model name if your Prisma model differs (e.g. listingAuditHistory / auditLog)
    const [items, total] = await Promise.all([
      prisma.listingAuditHistory.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: offset,
        take: limit,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      }),
      prisma.listingAuditHistory.count({ where }),
    ]);

    return NextResponse.json(
      {
        success: true,
        items,
        total,
        limit,
        offset,
        hasMore: offset + items.length < total,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("[GET /api/audit/listing-history]", error);

    return NextResponse.json(
      {
        success: false,
        error: "Failed to load listing audit history",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

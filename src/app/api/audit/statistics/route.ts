import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import type { Prisma } from "@prisma/client";

export const dynamic = "force-dynamic";

function parseDateStart(value: string | null): Date | undefined {
  if (!value) return undefined;
  const d = new Date(`${value}T00:00:00.000Z`);
  return Number.isNaN(d.getTime()) ? undefined : d;
}

function parseDateEnd(value: string | null): Date | undefined {
  if (!value) return undefined;
  const d = new Date(`${value}T23:59:59.999Z`);
  return Number.isNaN(d.getTime()) ? undefined : d;
}

function buildWhere(searchParams: URLSearchParams): Prisma.ListingAuditEntryWhereInput {
  const listingId = searchParams.get("listingId")?.trim() || undefined;
  const unitId = searchParams.get("unitId")?.trim() || undefined;
  const userId = searchParams.get("userId")?.trim() || undefined;

  // UI query params
  const action = searchParams.get("action")?.trim() || undefined;
  const status = searchParams.get("status")?.trim() || undefined;

  const dateFrom = parseDateStart(searchParams.get("dateFrom"));
  const dateTo = parseDateEnd(searchParams.get("dateTo"));

  const where: Prisma.ListingAuditEntryWhereInput = {};

  if (listingId) where.listingId = listingId;
  if (unitId) where.unitId = unitId;
  if (userId) where.userId = userId;

  // Enum filters (safe to pass as strings when values match enum names)
  if (action) where.action = action as any;
  if (status) where.newStatus = status as any; // UI "status" -> schema "newStatus"

  if (dateFrom || dateTo) {
    where.timestamp = {};
    if (dateFrom) where.timestamp.gte = dateFrom;
    if (dateTo) where.timestamp.lte = dateTo;
  }

  return where;
}

function toRecord(rows: Array<{ key: string | null; count: number }>): Record<string, number> {
  return rows.reduce<Record<string, number>>((acc, row) => {
    const key = row.key ?? "UNKNOWN";
    acc[key] = row.count;
    return acc;
  }, {});
}

export async function GET(request: NextRequest) {
  try {
    const where = buildWhere(request.nextUrl.searchParams);

    const [totalEntries, actionGroupRaw, statusGroupRaw, recentEntries] = await Promise.all([
      prisma.listingAuditEntry.count({ where }),

      prisma.listingAuditEntry.groupBy({
        by: ["action"],
        where,
        _count: { action: true },
        orderBy: { _count: { action: "desc" } },
      }),

      prisma.listingAuditEntry.groupBy({
        by: ["newStatus"],
        where,
        _count: { newStatus: true },
        orderBy: { _count: { newStatus: "desc" } },
      }),

      prisma.listingAuditEntry.findMany({
        where,
        select: {
          id: true,
          userId: true,
          action: true,
          newStatus: true,
          timestamp: true,
        },
        orderBy: { timestamp: "desc" },
        take: 500,
      }),
    ]);

    const actionBreakdown = toRecord(
      actionGroupRaw.map((r) => ({
        key: r.action ? String(r.action) : null,
        count: r._count.action ?? 0,
      }))
    );

    const statusBreakdown = toRecord(
      statusGroupRaw.map((r) => ({
        key: r.newStatus ? String(r.newStatus) : null,
        count: r._count.newStatus ?? 0,
      }))
    );

    const userActivity = recentEntries.reduce<Record<string, number>>((acc, row) => {
      const key = row.userId || "UNKNOWN";
      acc[key] = (acc[key] ?? 0) + 1;
      return acc;
    }, {});

    const timelineData = recentEntries.reduce<Record<string, number>>((acc, row) => {
      const key = new Date(row.timestamp).toISOString().slice(0, 10);
      acc[key] = (acc[key] ?? 0) + 1;
      return acc;
    }, {});

    return NextResponse.json(
      {
        success: true,
        data: {
          totalEntries,
          actionBreakdown,
          statusBreakdown,
          userActivity,
          timelineData,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("[GET /api/audit/statistics] Error:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Failed to load audit statistics",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

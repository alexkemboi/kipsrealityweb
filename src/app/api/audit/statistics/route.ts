import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

type AuditWhere = {
  listingId?: string;
  unitId?: string;
  userId?: string;
  action?: string;
  newStatus?: string;
  createdAt?: {
    gte?: Date;
    lte?: Date;
  };
};

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

function buildWhere(searchParams: URLSearchParams): AuditWhere {
  const listingId = searchParams.get("listingId")?.trim() || undefined;
  const unitId = searchParams.get("unitId")?.trim() || undefined;
  const userId = searchParams.get("userId")?.trim() || undefined;
  const action = searchParams.get("action")?.trim() || undefined;
  const status = searchParams.get("status")?.trim() || undefined;

  const dateFrom = parseDateStart(searchParams.get("dateFrom"));
  const dateTo = parseDateEnd(searchParams.get("dateTo"));

  const where: AuditWhere = {};

  if (listingId) where.listingId = listingId;
  if (unitId) where.unitId = unitId;
  if (userId) where.userId = userId;
  if (action) where.action = action;
  if (status) where.newStatus = status;

  if (dateFrom || dateTo) {
    where.createdAt = {};
    if (dateFrom) where.createdAt.gte = dateFrom;
    if (dateTo) where.createdAt.lte = dateTo;
  }

  return where;
}

function groupCount<T extends string>(rows: Array<{ key: T | null; _count: { _all: number } }>) {
  return rows.reduce<Record<string, number>>((acc, row) => {
    const key = row.key ?? "UNKNOWN";
    acc[key] = row._count._all;
    return acc;
  }, {});
}

export async function GET(request: NextRequest) {
  try {
    const where = buildWhere(request.nextUrl.searchParams);

    const [
      totalEntries,
      actionBreakdownRows,
      recentItems,
    ] = await Promise.all([
      prisma.listingAuditEntry.count({ where }),
      prisma.listingAuditEntry.groupBy({
        by: ["action"],
        where,
        _count: { _all: true },
        orderBy: {
          _count: {
            action: "desc",
          },
        },
      }) as unknown as Promise<Array<{ key: string | null; _count: { _all: number } }>>,
      prisma.listingAuditEntry.findMany({
        where,
        select: {
          id: true,
          userId: true,
          action: true,
          createdAt: true,
        },
        orderBy: { createdAt: "desc" },
        take: 500,
      }),
    ]);

    // Normalize groupBy rows because Prisma returns { action, _count }
    interface GroupByResult {
      action: string | null;
      _count: { _all: number };
    }
    
    const normalizedActionRows = (actionBreakdownRows as GroupByResult[]).map((r) => ({
      key: r.action ?? null,
      _count: r._count,
    }));

    const actionBreakdown = groupCount(normalizedActionRows);

    // Simple user activity aggregation
    const userActivity = recentItems.reduce<Record<string, number>>((acc, item) => {
      const key = item.userId ?? "UNKNOWN";
      acc[key] = (acc[key] ?? 0) + 1;
      return acc;
    }, {});

    // Simple daily timeline aggregation
    const timelineData = recentItems.reduce<Record<string, number>>((acc, item) => {
      const d = new Date(item.createdAt);
      const key = d.toISOString().slice(0, 10); // YYYY-MM-DD
      acc[key] = (acc[key] ?? 0) + 1;
      return acc;
    }, {});

    return NextResponse.json(
      {
        success: true,
        data: {
          totalEntries,
          actionBreakdown,
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

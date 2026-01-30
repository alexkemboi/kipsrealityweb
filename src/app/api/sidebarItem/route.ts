// app/api/sidebarItem/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// UserRole enum - local definition since it doesn't exist in Prisma schema
const UserRole = {
  SYSTEM_ADMIN: 'SYSTEM_ADMIN',
  PROPERTY_MANAGER: 'PROPERTY_MANAGER',
  TENANT: 'TENANT',
  VENDOR: 'VENDOR',
  AGENT: 'AGENT',
  ALL: 'ALL',
} as const;
type UserRole = typeof UserRole[keyof typeof UserRole];

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const roleParam = url.searchParams.get("role");
    const planIds = url.searchParams.get("planIds")?.split(",").map(Number) || [];
    const all = url.searchParams.get("all");

    console.log("API GET params:", { roleParam, planIds, all }); // Debug log

    // If "all" parameter is present, fetch all items (for admin view)
    if (all === "true") {
      const allItems = await prisma.sidebarItem.findMany({
        include: { feature: true, plans: true },
        orderBy: { order: "asc" },
      });
      console.log("Fetched all items:", allItems.length); // Debug log
      return NextResponse.json(allItems);
    }

    // Cast to UserRole
    let role: UserRole | undefined;
    if (roleParam && Object.values(UserRole).includes(roleParam as UserRole)) {
      role = roleParam as UserRole;
    }

    console.log("Parsed role:", role); // Debug log

    // Build WHERE clause - fetch items matching user's role OR items for ALL roles
    const whereClause = role
      ? {
        OR: [
          { role: role },
          { role: UserRole.ALL },
        ],
        isActive: true, // Only fetch active items
      }
      : {
        isActive: true,
      };

    console.log("WHERE clause:", JSON.stringify(whereClause, null, 2)); // Debug log

    const sidebarItems = await prisma.sidebarItem.findMany({
      include: { feature: true, plans: true },
      orderBy: { order: "asc" },
      where: whereClause,
    });

    console.log(`Found ${sidebarItems.length} items before filtering`); // Debug log

    // Filter by feature flags and plans
    const visibleItems = sidebarItems.filter((item) => {
      // Check if feature is active (if feature gate exists)
      const featureCheck = !item.feature || item.feature.isActive;

      // Check if user has required plan (if plans are specified)
      const planCheck = item.plans.length === 0 ||
        planIds.length === 0 ||
        item.plans.some((p: any) => planIds.includes(p.id));

      return featureCheck && planCheck;
    });

    console.log(`Returning ${visibleItems.length} visible items`); // Debug log

    return NextResponse.json(visibleItems);
  } catch (error) {
    console.error("GET /api/sidebarItem error:", error);
    return NextResponse.json(
      { error: "Failed to fetch sidebar items" },
      { status: 500 }
    );
  }
}

// POST new sidebar item
export async function POST(req: Request) {
  try {
    const data = await req.json();
    const {
      label,
      path,
      role,
      icon,
      section,
      order,
      badge,
      description,
      isActive = true,
      isExternal = false,
      target,
      featureId,
      planIds = [],
    } = data;

    // Validate required fields
    if (!label || !path || !role) {
      return NextResponse.json(
        { error: "Missing required fields: label, path, and role are required" },
        { status: 400 }
      );
    }

    // Validate role is valid enum value
    if (!Object.values(UserRole).includes(role as UserRole)) {
      return NextResponse.json(
        { error: `Invalid role: ${role}. Must be one of: ${Object.values(UserRole).join(", ")}` },
        { status: 400 }
      );
    }

    const sidebarItem = await prisma.sidebarItem.create({
      data: {
        label,
        path,
        role: role as UserRole,
        icon: icon || null,
        section: section || null,
        order: order || null,
        badge: badge || null,
        description: description || null,
        isActive,
        isExternal,
        target: target || null,
        feature: featureId ? { connect: { id: featureId } } : undefined,
        plans: planIds.length > 0 ? { connect: planIds.map((id: number) => ({ id })) } : undefined,
      },
      include: { feature: true, plans: true },
    });

    return NextResponse.json(sidebarItem);
  } catch (error) {
    console.error("POST /api/sidebarItem error:", error);
    return NextResponse.json(
      { error: "Failed to create sidebar item" },
      { status: 500 }
    );
  }
}

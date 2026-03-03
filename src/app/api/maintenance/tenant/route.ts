import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/Getcurrentuser";
import type { MaintenanceRequest } from "@prisma/client";

// GET /api/maintenance/tenant - Get tenant's maintenance requests
export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser(req);
    
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Find tenant's active lease to get property and unit info
    const activeLease = await prisma.lease.findFirst({
      where: {
        tenantId: user.id,
        leaseStatus: "ACTIVE",
      },
      include: {
        property: true,
        unit: true,
      },
    });

    if (!activeLease) {
      return NextResponse.json({ 
        requests: [],
        message: "No active lease found" 
      });
    }

    // Find organization user record for this tenant
    const orgUser = await prisma.organizationUser.findFirst({
      where: {
        userId: user.id,
        organizationId: activeLease.property.organizationId || undefined,
      },
    });

    if (!orgUser) {
      return NextResponse.json({ 
        requests: [],
        message: "User not found in organization" 
      });
    }

    // Fetch maintenance requests for this tenant's unit
    const requests = await prisma.maintenanceRequest.findMany({
      where: {
        organizationId: activeLease.property.organizationId || "",
        propertyId: activeLease.propertyId,
        unitId: activeLease.unitId,
        requestedById: orgUser.id,
      },
      orderBy: { createdAt: "desc" },
      include: {
        property: {
          select: {
            id: true,
            name: true,
            address: true,
            city: true,
          }
        },
        unit: { 
          select: { 
            id: true, 
            unitNumber: true, 
            unitName: true 
          } 
        },
        requestedBy: { 
          include: { 
            user: { 
              select: { 
                firstName: true, 
                lastName: true, 
                email: true 
              } 
            } 
          } 
        },
        vendors: { 
          include: { 
            user: { 
              select: { 
                firstName: true, 
                lastName: true 
              } 
            } 
          } 
        },
      },
    });

    return NextResponse.json({ 
      success: true,
      count: requests.length,
      requests: Array.isArray(requests) ? requests : [] 
    });

  } catch (error) {
    console.error("Tenant maintenance requests error:", error);
    
    // Check if error is due to missing table/column
    if (error instanceof Error && error.message.includes("does not exist")) {
      return NextResponse.json({ 
        success: false,
        error: "Maintenance requests feature not yet available",
        requests: [] 
      }, { status: 503 });
    }
    
    const errorMessage = error instanceof Error ? error.message : "Failed to fetch maintenance requests";
    return NextResponse.json({ 
      success: false,
      error: errorMessage,
      requests: [] 
    }, { status: 500 });
  }
}

// POST /api/maintenance/tenant - Create a new maintenance request
export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser(req);
    
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { title, description, priority = "NORMAL", category = "STANDARD" } = body;

    if (!title || !description) {
      return NextResponse.json({ 
        error: "Title and description are required" 
      }, { status: 400 });
    }

    // Find tenant's active lease to get property and unit info
    const activeLease = await prisma.lease.findFirst({
      where: {
        tenantId: user.id,
        leaseStatus: "ACTIVE",
      },
      include: {
        property: true,
        unit: true,
      },
    });

    if (!activeLease) {
      return NextResponse.json({ 
        error: "No active lease found" 
      }, { status: 404 });
    }

    // Find organization user record for this tenant
    const orgUser = await prisma.organizationUser.findFirst({
      where: {
        userId: user.id,
        organizationId: activeLease.property.organizationId || undefined,
      },
    });

    if (!orgUser) {
      return NextResponse.json({ 
        error: "User not found in organization" 
      }, { status: 403 });
    }

    // Validate priority
    const allowedPriorities = ["LOW", "NORMAL", "HIGH", "URGENT"];
    if (priority && !allowedPriorities.includes(priority)) {
      return NextResponse.json({ 
        error: `Invalid priority value: ${priority}` 
      }, { status: 400 });
    }

    // Validate category
    const allowedCategories = ["EMERGENCY", "URGENT", "ROUTINE", "STANDARD"];
    if (category && !allowedCategories.includes(category)) {
      return NextResponse.json({ 
        error: `Invalid category value: ${category}` 
      }, { status: 400 });
    }

    // Create the maintenance request
    const newRequest = await prisma.maintenanceRequest.create({
      data: {
        organizationId: activeLease.property.organizationId || "",
        propertyId: activeLease.propertyId,
        unitId: activeLease.unitId,
        requestedById: orgUser.id,
        title,
        description,
        priority: priority as "LOW" | "NORMAL" | "HIGH" | "URGENT",
        category: category as "EMERGENCY" | "URGENT" | "ROUTINE" | "STANDARD",
        status: "OPEN", // Default status
      },
    });

    return NextResponse.json({ 
      success: true,
      request: newRequest,
      message: "Maintenance request created successfully" 
    }, { status: 201 });

  } catch (error) {
    console.error("Create maintenance request error:", error);
    
    // Check if error is due to missing table
    if (error instanceof Error && error.message.includes("does not exist")) {
      return NextResponse.json({ 
        success: false,
        error: "Maintenance requests feature not yet available" 
      }, { status: 503 });
    }
    
    const errorMessage = error instanceof Error ? error.message : "Failed to create maintenance request";
    return NextResponse.json({ 
      success: false,
      error: errorMessage 
    }, { status: 500 });
  }
}

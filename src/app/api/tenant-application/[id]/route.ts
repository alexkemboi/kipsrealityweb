import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db"; // Adjust path to your prisma client
import { ApplicationStatus } from "@prisma/client";
// import { getServerSession } from "next-auth"; 
// import { authOptions } from "@/lib/auth"; // Adjust to your auth config

export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const { status } = await req.json();

    if (!status) {
      return NextResponse.json({ error: "Status is required" }, { status: 400 });
    }

    const normalizedStatus = status.toUpperCase().replace(" ", "_");

    if (!["PENDING", "APPROVED", "REJECTED", "UNDER_REVIEW"].includes(normalizedStatus)) {
      return NextResponse.json({
        error: "Invalid status. Must be PENDING, APPROVED, REJECTED, UNDER_REVIEW",
      }, { status: 400 });
    }

    const updatedApplication = await prisma.tenantapplication.update({
      where: { id },
      data: { status: normalizedStatus as ApplicationStatus },
      include: {
        property: true,
        unit: true,
        user: true,
      },
    });

    return NextResponse.json(updatedApplication, { status: 200 });

  } catch (error: any) {
    console.error("Error updating application:", error);

    if (error.code === "P2025") {
      return NextResponse.json({ error: "Application not found" }, { status: 404 });
    }

    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}



// Optional: Add GET method to fetch single application
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const application = await prisma.tenantapplication.findUnique({
      where: { id },
      include: {
        property: true,
        unit: true,
        user: true,
      },
    });

    if (!application) {
      return NextResponse.json(
        { error: "Application not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(application, { status: 200 });
  } catch (error: any) {
    console.error("Error fetching application:", error);
    return NextResponse.json(
      { error: "Failed to fetch application", details: error.message },
      { status: 500 }
    );
  }
}

// Optional: Add DELETE method
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    await prisma.tenantapplication.delete({
      where: { id },
    });

    return NextResponse.json(
      { message: "Application deleted successfully" },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error deleting application:", error);

    if (error.code === "P2025") {
      return NextResponse.json(
        { error: "Application not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { error: "Failed to delete application", details: error.message },
      { status: 500 }
    );
  }
}
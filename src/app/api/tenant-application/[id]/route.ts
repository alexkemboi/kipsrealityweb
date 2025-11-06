import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db"; // Adjust path to your prisma client
// import { getServerSession } from "next-auth"; 
// import { authOptions } from "@/lib/auth"; // Adjust to your auth config

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Optional: Add authentication check
    // const session = await getServerSession(authOptions);
    // if (!session) {
    //   return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    // }

    const { id } = params;
    const body = await req.json();
    const { status } = body;

    // Validate status
    if (!status || !["Pending", "Approved", "Rejected", "PENDING", "APPROVED", "REJECTED"].includes(status)) {
      return NextResponse.json(
        { error: "Invalid status. Must be Pending, Approved, or Rejected" },
        { status: 400 }
      );
    }

    // Update the application
    const updatedApplication = await prisma.tenantapplication.update({
      where: { id },
      data: { 
        status: status.toUpperCase() as "PENDING" | "APPROVED" | "REJECTED" 
      },
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
      return NextResponse.json(
        { error: "Application not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { error: "Failed to update application", details: error.message },
      { status: 500 }
    );
  }
}

// Optional: Add GET method to fetch single application
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

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
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

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
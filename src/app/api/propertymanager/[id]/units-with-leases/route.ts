import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: propertyId } = await params;

  console.log("API called for propertyId:", propertyId);

  if (!propertyId) {
    return NextResponse.json({ error: "Missing propertyId" }, { status: 400 });
  }

  try {
    const unitsWithLeases = await prisma.unit.findMany({
      where: { propertyId },
      include: {
        leases: {
          include: {
            tenant: true,
            application: true // Include applicant info
          },
        },
      },
      orderBy: { unitNumber: "asc" },
    });

    console.log("Fetched units:", unitsWithLeases.length);

    return NextResponse.json(unitsWithLeases);
  } catch (err: any) {
    console.error("Error fetching units with leases:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

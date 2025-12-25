import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/Getcurrentuser"; 

export async function GET(req: Request) {
  try {
    // Get the current logged-in user
    const user = await getCurrentUser(req);

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Assuming your tenant is identified by user.id
    const tenantId = user.id;

    // Fetch invoices for this tenant
    const invoices = await prisma.invoice.findMany({
      where: {
        lease: {
          tenantId: tenantId, // filter by tenant
        },
      },
      orderBy: { dueDate: "asc" },
      include: {
         payments: {
           include: { receipts: true }
         },
         lease: true,
       },
    });

    return NextResponse.json(invoices);
  } catch (error) {
    console.error("Error fetching invoices for tenant:", error);
    return NextResponse.json({ error: "Failed to fetch invoices" }, { status: 500 });
  }
}

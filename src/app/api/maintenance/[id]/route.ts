import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

import { maintenanceService } from "@/lib/finance/maintenance-service";
import { MaintenanceRequest_status } from "@prisma/client";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { status, cost, isTenantChargeable } = await req.json();

  if (!id) {
    return NextResponse.json({ error: "Missing required id" }, { status: 400 });
  }

  try {
    const updated = await prisma.maintenanceRequest.update({
      where: { id },
      data: {
        ...(status ? { status } : {}),
        ...(cost !== undefined ? { cost } : {}),
        ...(isTenantChargeable !== undefined ? { isTenantChargeable } : {}),
      },
    });

    // If status updated to COMPLETED, trigger financial billing
    if (status === MaintenanceRequest_status.COMPLETED && updated.cost && Number(updated.cost) > 0) {
      await maintenanceService.postMaintenanceBill(id);
    }

    return NextResponse.json(updated);
  } catch (error) {
    console.error('Maintenance update error:', error);
    const errMsg = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: errMsg }, { status: 500 });
  }
}

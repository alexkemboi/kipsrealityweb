import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function PATCH(req: { json: () => PromiseLike<{ status: any; cost: any; }> | { status: any; cost: any; }; }, { params }: any) {
  const id = params.id;
  const { status, cost } = await req.json();

  if (!id || !status || cost === undefined) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  try {
    const updated = await prisma.maintenanceRequest.update({
      where: { id },
      data: {
        status,
        cost,
      },
    });
    return NextResponse.json(updated);
  } catch (error) {
    const errMsg = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: errMsg }, { status: 500 });
  }
}

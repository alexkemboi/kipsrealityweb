import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
  const now = new Date();

  const overdue = await prisma.invoice.updateMany({
    where: {
      dueDate: { lt: now },
      status: "PENDING",
    },
    data: { status: "OVERDUE" },
  });

  return NextResponse.json({ message: `Marked ${overdue.count} invoices as overdue` });
}

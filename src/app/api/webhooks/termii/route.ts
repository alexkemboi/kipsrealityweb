import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(req: Request) {
    try {
        const body = await req.json();

        // Termii usually sends a payload like:
        // { "id": "msg_id", "status": "delivered", "phone": "254...", ... }

        console.log("🔔 Termii Webhook Received:", body);

        const { id, status } = body;

        // TODO: update your database logs if you are tracking specific message IDs
        // Example:
        // await prisma.smsLog.update({ 
        //   where: { messageId: id }, 
        //   data: { status: status } 
        // });

        return NextResponse.json({ message: "Webhook received" }, { status: 200 });

    } catch (error) {
        console.error("Webhook Error:", error);
        return NextResponse.json({ error: "Invalid Payload" }, { status: 400 });
    }
}

// Termii sometimes checks with GET to verify the URL exists
export async function GET() {
    return NextResponse.json({ status: "alive" });
}
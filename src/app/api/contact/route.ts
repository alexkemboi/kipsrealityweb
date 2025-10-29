import { PrismaClient } from "@prisma/client";
import { NextResponse,NextRequest } from "next/server";
import { z } from "zod";
import {contactSchema, ContactData} from "@/app/data/ContactData";

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const parsed = contactSchema.safeParse(body);
    if (!parsed.success) {
  return NextResponse.json(
    {
      message: "Validation failed",
      errors: parsed.error.issues.map((issue) => ({
        path: issue.path.join("."), // e.g. "email" or "phone"
        message: issue.message,
      })),
    },
    { status: 400 }
  );
}
    const data: ContactData = parsed.data;
    const { name, email, countryCode, phone, message } = data;

    const fullPhone = `${countryCode}${phone}`;

    const newContact = await prisma.contactMessage.create({
      data: {
        name,
        email,
        countryCode,
        phone: fullPhone,
        message,
      },
    });

    // 5️⃣ Return success response
    return NextResponse.json(
      {
        message: "Message sent successfully",
        contact: newContact,
      },
      { status: 201 }
    );

  } catch (error) {
    console.error(" Error submitting contact form:", error);
    return NextResponse.json(
      { error: "Server error while submitting message" },
      { status: 500 }
    );
  }
}
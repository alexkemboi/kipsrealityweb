import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { cookies } from "next/headers";
import { journalService } from "@/lib/finance/journal-service";

const DEFAULT_ORG_ID = "46e17dc1-137b-4e7a-a254-797a8ce16b0d";

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const page = parseInt(searchParams.get("page") || "1");
        const limit = parseInt(searchParams.get("limit") || "20");
        const skip = (page - 1) * limit;

        const organizationId = searchParams.get("organizationId") || DEFAULT_ORG_ID;
        const entryId = searchParams.get("entryId");
        const reference = searchParams.get("reference");
        const referenceStartsWith = searchParams.get("referenceStartsWith");

        // 1. Auth Check (currently optional)
        const cookieStore = await cookies();
        const token = cookieStore.get("token")?.value;

        // 2. Get Financial Entity
        const entity = await prisma.financialEntity.findFirst({
            where: { organizationId }
        });

        if (!entity) {
            return NextResponse.json({ success: true, data: [], total: 0 });
        }

        // 3. Fetch Journal Entries
        const where: any = {
            entityId: entity.id,
        };

        if (entryId) {
            where.id = entryId;
        }

        if (reference) {
            where.reference = reference;
        } else if (referenceStartsWith) {
            where.reference = { startsWith: referenceStartsWith };
        }

        const entries = await prisma.journalEntry.findMany({
            where,
            include: {
                lines: {
                    include: {
                        account: true,
                        property: {
                            select: { address: true, city: true }
                        },
                        unit: {
                            select: { unitNumber: true }
                        }
                    }
                }
            },
            orderBy: { transactionDate: 'desc' },
            skip,
            take: limit
        });

        const total = await prisma.journalEntry.count({
            where
        });

        return NextResponse.json({
            success: true,
            data: entries,
            pagination: {
                total,
                page,
                limit,
                pages: Math.ceil(total / limit)
            }
        });

    } catch (error: any) {
        console.error("[Journal API Error]", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { organizationId, date, reference, description, lines } = body || {};

        if (!organizationId || !reference || !description || !Array.isArray(lines) || lines.length < 2) {
            return NextResponse.json({
                error: "organizationId, reference, description, and at least 2 lines are required"
            }, { status: 400 });
        }

        const entry = await journalService.post({
            organizationId,
            date: date ? new Date(date) : new Date(),
            reference,
            description,
            lines,
        });

        const hydrated = await prisma.journalEntry.findUnique({
            where: { id: entry.id },
            include: {
                lines: { include: { account: true } }
            }
        });

        return NextResponse.json({
            success: true,
            data: hydrated || entry
        }, { status: 201 });

    } catch (error: any) {
        console.error("[Journal POST API Error]", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

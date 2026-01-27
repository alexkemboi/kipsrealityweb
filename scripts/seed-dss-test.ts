import { PrismaClient, DssDocumentStatus } from "@prisma/client";
import crypto from "crypto";

const prisma = new PrismaClient();

async function main() {
    // 1. Get Organization
    const org = await prisma.organization.findFirst();
    if (!org) {
        console.error("❌ No Organization found. Please create an organization first.");
        return;
    }

    // 2. Create Completed Doc
    const doc = await prisma.dssDocument.create({
        data: {
            title: "Notarization Test Document",
            organizationId: org.id,
            status: DssDocumentStatus.COMPLETED, // <--- Key requirement
            originalPdfSha256Hex: "original_hash_mock_" + crypto.randomBytes(4).toString('hex'),
            finalPdfSha256Hex: crypto.randomBytes(32).toString('hex'), // <--- Key requirement
            completedAt: new Date(),
            originalFileKey: "mock-key",
            mimeType: "application/pdf"
        }
    });

    console.log(`✅ ID: ${doc.id}`);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(() => prisma.$disconnect());

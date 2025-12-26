import { prisma } from "@/lib/db";
import { BlockchainNotaryStatus, DssDocumentStatus } from "@prisma/client";
import crypto from "crypto";

// Mock Environment Variables for Blockchain (Add these to .env later)
const MOCK_CHAIN_ID = 8453; // Base Mainnet (Example)
const MOCK_CONTRACT_ADDRESS = "0x1234567890abcdef1234567890abcdef12345678";

/**
 * SIMULATOR: Interacts with the Blockchain.
 * In production, this would use 'ethers' or 'viem' to call your Smart Contract.
 */
async function writeHashToBlockchain(docHash: string) {
    console.log(`🔗 [Blockchain] Sending transaction for hash: ${docHash}`);

    // Simulate network latency (1-3 seconds)
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Simulate a Transaction Receipt
    return {
        txHash: "0x" + crypto.randomBytes(32).toString("hex"),
        blockNumber: 12345678,
        status: "SUCCESS"
    };
}

/**
 * Main Entry Point: Notarize a Completed Document
 */
export async function notarizeDocument(documentId: string) {
    // 1. Fetch Document & Validation
    const doc = await prisma.dssDocument.findUnique({
        where: { id: documentId },
        include: { notaryRecord: true }
    });

    if (!doc) throw new Error("Document not found");

    if (doc.status !== DssDocumentStatus.COMPLETED) {
        throw new Error("Document must be COMPLETED before notarization.");
    }

    if (!doc.finalPdfSha256Hex) {
        throw new Error("Critical: Document is missing the Final PDF Hash.");
    }

    if (doc.notaryRecord) {
        throw new Error(`Document is already notarized (Status: ${doc.notaryRecord.status})`);
    }

    console.log(`📜 [Notary] Starting notarization for Doc ID: ${documentId}`);

    // 2. Create "PENDING" Record (Idempotency)
    // We reserve the spot in the DB before calling the chain
    const record = await prisma.dssNotaryRecord.create({
        data: {
            documentId: doc.id,
            organizationId: doc.organizationId,
            chainId: MOCK_CHAIN_ID,
            contractAddress: MOCK_CONTRACT_ADDRESS,
            notarizedHash: doc.finalPdfSha256Hex,
            status: BlockchainNotaryStatus.PENDING
        }
    });

    try {
        // 3. Call the Blockchain (The Expensive Step)
        const txReceipt = await writeHashToBlockchain(doc.finalPdfSha256Hex);

        // 4. Update DB with Success
        const updatedRecord = await prisma.dssNotaryRecord.update({
            where: { id: record.id },
            data: {
                status: BlockchainNotaryStatus.CONFIRMED,
                txHash: txReceipt.txHash,
                blockNumber: txReceipt.blockNumber,
                confirmedAt: new Date()
            }
        });

        console.log(`✅ [Notary] Success! Tx: ${updatedRecord.txHash}`);
        return updatedRecord;

    } catch (error: any) {
        console.error("❌ [Notary] Blockchain Transaction Failed:", error);

        // 5. Handle Failure
        await prisma.dssNotaryRecord.update({
            where: { id: record.id },
            data: {
                status: BlockchainNotaryStatus.FAILED,
                // In real app, store error message if you add a field for it
            }
        });
        throw new Error("Blockchain notarization failed. Please retry.");
    }
}

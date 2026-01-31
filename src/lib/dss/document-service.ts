import { prisma } from "@/lib/db";
import { computeDocumentHash, verifyDocumentIntegrity } from "./hashing";
import { getNextSigner } from "./workflow";
import { DssParticipantRole, DssDocumentStatus, DssSigningMode, DssParticipant } from "@prisma/client";

// Placeholder for actual file upload storage (S3/UploadThing)
async function uploadFileToStorage(fileBuffer: Buffer): Promise<{ url: string; key: string }> {
    // TODO: Replace with actual UploadThing or S3 logic
    // For now, we simulate a successful upload
    const fakeId = crypto.randomUUID();
    console.log("Mock Upload: File uploaded to storage", fakeId);
    return {
        url: `https://mock-storage.com/${fakeId}.pdf`,
        key: fakeId
    };
}

interface CreateDocumentParams {
    title: string;
    organizationId: string;
    fileBuffer: Buffer;
    participants: {
        email: string;
        role: DssParticipantRole;
        name?: string;
    }[];
    signingMode?: DssSigningMode;
}

/**
 * Creates a new DSS Document.
 * Strategy: Hash -> Upload -> Save DB
 */
export async function createDocument({
    title,
    organizationId,
    fileBuffer,
    participants,
    signingMode = DssSigningMode.SEQUENTIAL
}: CreateDocumentParams) {
    // 1. Compute Hash immediately (Integrity Baseline)
    const sha256Hex = computeDocumentHash(fileBuffer);

    // 2. Upload to Storage
    // We do this AFTER hashing to ensure we know exactly what is being stored
    const { url, key } = await uploadFileToStorage(fileBuffer);

    // 3. Create Document & Participants in Transaction
    // We enforce basic sequential order logic here:
    const participantsWithOrder = participants.map((p, index) => ({
        ...p,
        stepOrder: index + 1 // Simple 1-based sequence based on input array order
    }));

    const doc = await prisma.dssDocument.create({
        data: {
            organizationId,
            title,
            originalPdfSha256Hex: sha256Hex,
            originalFileUrl: url,
            originalFileKey: key,
            signingMode,
            participants: {
                create: participantsWithOrder.map(p => ({
                    organizationId, // Inherit org from doc
                    email: p.email,
                    role: p.role,
                    name: p.name,
                    stepOrder: p.stepOrder
                }))
            }
        },
        include: {
            participants: true
        }
    });

    return doc;
}

/**
 * Executes a signing action for a participant.
 */
interface SignDocumentResult {
    success: boolean;
    result: { status: string };
}

export async function signDocument(documentId: string, userEmail: string, signatureData: string, onBehalfOf?: string): Promise<SignDocumentResult> {
    // 1. Get Security Baseline & Permissions
    const workflowStatus = await getNextSigner(documentId);

    // We need to fetch participants to find the specific user record
    const doc = await prisma.dssDocument.findUnique({
        where: { id: documentId },
        include: { participants: true }
    });

    if (!doc) throw new Error("Document not found");

    // 2. Validate it is THIS user's turn
    const participant = doc.participants.find((p: DssParticipant) => p.email === userEmail);
    if (!participant) throw new Error("User is not a participant of this document");

    if (doc.signingMode === DssSigningMode.SEQUENTIAL) {
        if (workflowStatus.nextStep !== participant.stepOrder) {
            throw new Error("It is not your turn to sign this document.");
        }
    }

    if (participant.hasSigned) {
        throw new Error("You have already signed this document.");
    }

    // 2.5 Validate proxy signing requirements
    const isProxy = participant.role === "CUSTODIAN";
    if (isProxy && !onBehalfOf) {
        throw new Error("Custodian must specify who they are signing on behalf of (onBehalfOf).");
    }
    if (!isProxy && onBehalfOf) {
        throw new Error("Only custodians can sign on behalf of others.");
    }

    // 3. Apply Signature (Atomic Transaction)
    // We compute a "Server-Proof" of the signature.
    const signatureProof = computeDocumentHash(Buffer.from(signatureData + doc.originalPdfSha256Hex));

    const result = await prisma.$transaction(async (tx) => {
        // A. Update Participant
        await tx.dssParticipant.update({
            where: { id: participant.id },
            data: {
                hasSigned: true,
                signedAt: new Date(),
            }
        });

        // B. Create Signature Record
        await tx.dssSignature.create({
            data: {
                documentId,
                participantId: participant.id,
                signatureHash: signatureProof,
                isProxy,
                onBehalfOf
            }
        });

        // C. Check Workflow Completion (Database Source of Truth)
        // Count how many participants for this doc have NOT signed yet.
        const remainingSigners = await tx.dssParticipant.count({
            where: {
                documentId,
                hasSigned: false
            }
        });

        if (remainingSigners === 0) {
            // Everyone has signed!
            await tx.dssDocument.update({
                where: { id: documentId },
                data: {
                    status: DssDocumentStatus.COMPLETED,
                    completedAt: new Date(),
                    // In a real PDF engine, we would generate the final PDF bytes here
                    // and hash them. For now, we reuse original hash as placeholder.
                    finalPdfSha256Hex: doc.originalPdfSha256Hex
                }
            });
            return { status: "COMPLETED" };
        } else {
            // Update status to IN_SIGNING if it wasn't already
            if (doc.status === DssDocumentStatus.DRAFT || doc.status === DssDocumentStatus.SENT) {
                await tx.dssDocument.update({
                    where: { id: documentId },
                    data: { status: DssDocumentStatus.IN_SIGNING }
                });
            }
            return { status: "IN_PROGRESS" };
        }
    });

    return { success: true, result };
}

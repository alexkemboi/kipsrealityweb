import { prisma } from "@/lib/db";
import { DssDocumentStatus, DssParticipantRole, DssParticipant } from "@prisma/client";
import { WorkflowResult } from "./types";

/**
 * Determines the next step in the signing workflow.
 * Enforces SEQUENTIAL processing based on 'stepOrder'.
 */
export async function getNextSigner(documentId: string): Promise<WorkflowResult> {
    // 1. Fetch document and participants
    const document = await prisma.dssDocument.findUnique({
        where: { id: documentId },
        include: {
            participants: {
                orderBy: { stepOrder: 'asc' }
            }
        }
    });

    if (!document) {
        throw new Error(`Document not found: ${documentId}`);
    }

    // 2. Check if already complete/voided
    if (document.status === DssDocumentStatus.COMPLETED || document.status === DssDocumentStatus.VOIDED) {
        return {
            isComplete: true,
            nextStep: null,
            nextRole: null
        };
    }

    // 3. Find the first participant who hasn't signed
    // Since we ordered by stepOrder asc, the first one we find is the "bottleneck"
    const nextParticipant = document.participants.find((p) => !p.hasSigned);

    if (!nextParticipant) {
        // All signed!
        return {
            isComplete: true,
            nextStep: null,
            nextRole: null
        };
    }

    // 4. Return the next step details
    return {
        isComplete: false,
        nextStep: nextParticipant.stepOrder,
        nextRole: nextParticipant.role
    };
}

/**
 * Checks if a specific user (by Role or ID) is allowed to sign RIGHT NOW.
 */
export async function canUserSignNow(documentId: string, userEmail: string): Promise<boolean> {
    const result = await getNextSigner(documentId);

    if (result.isComplete) return false;

    const document = await prisma.dssDocument.findUnique({
        where: { id: documentId },
        include: { participants: true }
    });

    if (!document) return false;

    // Find the participant record for this user
    const participant = document.participants.find((p) => p.email === userEmail);

    if (!participant) return false; // Not a participant

    // Check if it's their turn
    // It's their turn if the "nextStep" matches their "stepOrder"
    // (In a strictly sequential flow)
    return result.nextStep === participant.stepOrder;
}

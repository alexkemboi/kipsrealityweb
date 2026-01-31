import { DssParticipantRole, DssDocumentStatus } from "@prisma/client";

// Define the hierarchy of signing power if needed
export const ROLE_HIERARCHY: Record<DssParticipantRole, number> = {
    TENANT: 1,           // Signs First
    LANDLORD: 2,         // Signs Second
    PROPERTY_MANAGER: 2, // Equivalent to Landlord
    AGENT: 2,
    WITNESS: 3,          // Signs Last
    NOTARY: 4,           // Final seal
    CUSTODIAN: 2,        // Equivalent to Landlord/Property Manager (signs on behalf of someone)
    VENDOR: 0,
    OTHER: 0
};

export interface SignerAction {
    userId: string;
    role: DssParticipantRole;
    signatureData: string; // Base64 or Text representation of signature
    ipAddress?: string;
    userAgent?: string;
}

export interface WorkflowResult {
    isComplete: boolean;
    nextStep: number | null;
    nextRole: DssParticipantRole | null;
}

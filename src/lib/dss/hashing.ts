import crypto from 'crypto';

/**
 * Computes the SHA-256 hash of a file buffer.
 * This is the standard used for EVM Blockchain notarization.
 * 
 * @param fileBuffer - The raw bytes of the PDF file
 * @returns Hex string (e.g., "a3f5...")
 */
export function computeDocumentHash(fileBuffer: Buffer): string {
    const hashSum = crypto.createHash('sha256');
    hashSum.update(fileBuffer);
    return hashSum.digest('hex');
}

/**
 * Verifies if a file matches a specific hash.
 * Used to check integrity before signing.
 */
export function verifyDocumentIntegrity(fileBuffer: Buffer, expectedHash: string): boolean {
    const calculatedHash = computeDocumentHash(fileBuffer);
    return calculatedHash === expectedHash;
}

// ---------------------------------------------------------
// 🔮 FUTURE PROOFING (Placeholders for Advanced Cryptography)
// ---------------------------------------------------------

/**
 * Generates a "Post-Quantum" placeholder hash.
 * Currently derives from SHA-256 but allows the schema to be populated
 * without breaking when we upgrade crypto libraries later.
 */
export function computePqHash(fileBuffer: Buffer): string {
    // In a real PQ implementation, this would use CRYSTALS-Dilithium or SPHINCS+
    // For now, we salt it to distinguish it from the main hash in the DB
    const hashSum = crypto.createHash('sha512'); // Using 512 for "stronger" appearance
    hashSum.update(fileBuffer);
    return `pq_placeholder_${hashSum.digest('hex').substring(0, 32)}`;
}

/**
 * Generates a "Zero-Knowledge" placeholder proof.
 */
export function computeZkProofPlaceholder(fileBuffer: Buffer): string {
    // Real implementation would involve SnarkJS
    return `zk_proof_mock_${Date.now()}`;
}

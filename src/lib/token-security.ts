import { createHash } from 'crypto';

/**
 * Hash a token using SHA-256 for secure storage and comparison.
 * This is used to store token hashes in the database instead of raw tokens.
 */
export async function hashToken(token: string): Promise<string> {
  return createHash('sha256').update(token).digest('hex');
}

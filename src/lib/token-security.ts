import crypto from 'crypto';

/**
 * Token security utilities for hashing and verifying tokens
 */

/**
 * Hashes a token using SHA-256 for secure storage and comparison
 * @param token - The plain token to hash
 * @returns Promise resolving to hex-encoded hash
 */
export async function hashToken(token: string): Promise<string> {
  if (!token || typeof token !== 'string') {
    throw new Error('Token must be a non-empty string');
  }
  
  return crypto
    .createHash('sha256')
    .update(token)
    .digest('hex');
}

/**
 * Compares a plain token with a hashed token
 * @param plainToken - The plain token to compare
 * @param hashedToken - The previously hashed token to compare against
 * @returns Promise resolving to boolean indicating match
 */
export async function verifyToken(plainToken: string, hashedToken: string): Promise<boolean> {
  if (!plainToken || !hashedToken) {
    return false;
  }
  
  const hash = await hashToken(plainToken);
  return hash === hashedToken;
}

/**
 * Generates a secure random token
 * @param length - Length in bytes (default: 32)
 * @returns Hex-encoded random token
 */
export function generateRandomToken(length: number = 32): string {
  return crypto.randomBytes(length).toString('hex');
}

/**
 * Creates a time-based token with expiration
 * @param data - Data to include in token
 * @param expiresInSeconds - Expiration time in seconds (default: 3600 = 1 hour)
 * @returns Object containing token and expiration timestamp
 */
export function createTimedToken(data: string, expiresInSeconds: number = 3600): {
  token: string;
  expiresAt: Date;
} {
  const token = crypto.randomBytes(32).toString('hex');
  const expiresAt = new Date(Date.now() + expiresInSeconds * 1000);
  
  // In a real implementation, you might want to store this with the data
  // For now, we return a simple token
  return { token, expiresAt };
}

export default {
  hashToken,
  verifyToken,
  generateRandomToken,
  createTimedToken,
};
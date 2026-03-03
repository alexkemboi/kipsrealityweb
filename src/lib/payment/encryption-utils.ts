/**
 * Payment Encryption Utilities
 * Provides encryption for non-PCI payment data (metadata, user info, etc.)
 * Note: PCI data (card numbers, CVV) should NEVER be handled by this application
 */

import crypto from 'crypto';

// Type definitions for GCM cipher/decipher
interface GCMCipher extends crypto.Cipher {
  getAuthTag(): Buffer;
}

interface GCMDecipher extends crypto.Decipher {
  setAuthTag(tag: Buffer): void;
}

export enum EncryptionPurpose {
  PAYMENT_METADATA = 'PAYMENT_METADATA',
  USER_INFO = 'USER_INFO',
  TRANSACTION_DETAILS = 'TRANSACTION_DETAILS',
  WEBHOOK_PAYLOAD = 'WEBHOOK_PAYLOAD'
}

export interface EncryptionConfig {
  algorithm: string;
  keyLength: number; // in bytes
  ivLength: number;
  authTagLength: number;
  encoding: BufferEncoding;
}

const DEFAULT_CONFIG: EncryptionConfig = {
  algorithm: 'aes-256-gcm',
  keyLength: 32, // 256 bits
  ivLength: 16,
  authTagLength: 16,
  encoding: 'base64'
};

export class PaymentEncryptionError extends Error {
  constructor(
    message: string,
    public readonly purpose: EncryptionPurpose,
    public readonly operation: 'encrypt' | 'decrypt' | 'key_validation',
    public readonly cause?: Error
  ) {
    super(message);
    this.name = 'PaymentEncryptionError';
  }
}

export class PaymentEncryptionUtils {
  private static instance: PaymentEncryptionUtils;
  private config: EncryptionConfig;
  private keyCache: Map<string, Buffer> = new Map();

  private constructor(config: EncryptionConfig = DEFAULT_CONFIG) {
    this.config = config;
  }

  public static getInstance(config?: EncryptionConfig): PaymentEncryptionUtils {
    if (!PaymentEncryptionUtils.instance) {
      PaymentEncryptionUtils.instance = new PaymentEncryptionUtils(config);
    }
    return PaymentEncryptionUtils.instance;
  }

  /**
   * Get encryption key for a specific purpose
   */
  private getKey(purpose: EncryptionPurpose): Buffer {
    const envKeyName = this.getEnvKeyName(purpose);
    const key = process.env[envKeyName];
    
    if (!key) {
      throw new PaymentEncryptionError(
        `Encryption key not configured for purpose: ${purpose}. Set ${envKeyName} environment variable.`,
        purpose,
        'key_validation'
      );
    }

    // Check cache first
    const cacheKey = `${purpose}:${key}`;
    if (this.keyCache.has(cacheKey)) {
      return this.keyCache.get(cacheKey)!;
    }

    try {
      const keyBuffer = Buffer.from(key, this.config.encoding);
      
      if (keyBuffer.length !== this.config.keyLength) {
        throw new PaymentEncryptionError(
          `Invalid key length for ${purpose}. Expected ${this.config.keyLength} bytes, got ${keyBuffer.length}.`,
          purpose,
          'key_validation'
        );
      }
      
      this.keyCache.set(cacheKey, keyBuffer);
      return keyBuffer;
    } catch (error) {
      if (error instanceof PaymentEncryptionError) {
        throw error;
      }
      throw new PaymentEncryptionError(
        `Invalid key format for ${purpose}. Key must be ${this.config.encoding} encoded.`,
        purpose,
        'key_validation',
        error as Error
      );
    }
  }

  /**
   * Get environment variable name for a specific encryption purpose
   */
  private getEnvKeyName(purpose: EncryptionPurpose): string {
    const prefix = 'PAYMENT_ENCRYPTION_KEY';
    
    switch (purpose) {
      case EncryptionPurpose.PAYMENT_METADATA:
        return `${prefix}_METADATA`;
      case EncryptionPurpose.USER_INFO:
        return `${prefix}_USER_INFO`;
      case EncryptionPurpose.TRANSACTION_DETAILS:
        return `${prefix}_TRANSACTION`;
      case EncryptionPurpose.WEBHOOK_PAYLOAD:
        return `${prefix}_WEBHOOK`;
      default:
        return `${prefix}_DEFAULT`;
    }
  }

  /**
   * Encrypt data for a specific purpose
   */
  encrypt(data: string | object, purpose: EncryptionPurpose): string {
    try {
      const plaintext = typeof data === 'string' ? data : JSON.stringify(data);
      
      if (!plaintext || plaintext.trim().length === 0) {
        throw new Error('Data to encrypt cannot be empty');
      }

      const key = this.getKey(purpose);
      const iv = crypto.randomBytes(this.config.ivLength);
      
      const cipher = crypto.createCipheriv(this.config.algorithm, key, iv) as GCMCipher;
      
      // Encrypt the plaintext
      let ciphertext = cipher.update(plaintext, 'utf8', 'hex');
      ciphertext += cipher.final('hex');
      
      // Get the authentication tag
      const authTag = cipher.getAuthTag();
      
      // Format: purpose:iv:ciphertext:authTag (all hex encoded)
      const purposePrefix = purpose.substring(0, 3).toUpperCase(); // First 3 chars
      return `${purposePrefix}:${iv.toString('hex')}:${ciphertext}:${authTag.toString('hex')}`;
    } catch (error) {
      if (error instanceof PaymentEncryptionError) {
        throw error;
      }
      throw new PaymentEncryptionError(
        `Failed to encrypt ${purpose} data: ${error instanceof Error ? error.message : 'Unknown error'}`,
        purpose,
        'encrypt',
        error as Error
      );
    }
  }

  /**
   * Decrypt data that was encrypted for a specific purpose
   */
  decrypt(encryptedString: string, expectedPurpose?: EncryptionPurpose): string {
    try {
      if (!encryptedString || typeof encryptedString !== 'string') {
        throw new Error('Encrypted string must be a non-empty string');
      }

      // Parse the encrypted string format
      const parts = encryptedString.split(':');
      if (parts.length !== 4) {
        throw new Error('Invalid encrypted string format. Expected purpose:iv:ciphertext:authTag');
      }

      const [purposePrefix, ivHex, ciphertext, authTagHex] = parts;
      
      // Determine purpose from prefix or use expected purpose
      let purpose: EncryptionPurpose;
      if (expectedPurpose) {
        purpose = expectedPurpose;
      } else {
        purpose = this.getPurposeFromPrefix(purposePrefix);
      }

      const key = this.getKey(purpose);
      const iv = Buffer.from(ivHex, 'hex');
      const authTag = Buffer.from(authTagHex, 'hex');
      
      if (iv.length !== this.config.ivLength) {
        throw new Error(`Invalid IV length: expected ${this.config.ivLength} bytes, got ${iv.length}`);
      }
      
      if (authTag.length !== this.config.authTagLength) {
        throw new Error(`Invalid auth tag length: expected ${this.config.authTagLength} bytes, got ${authTag.length}`);
      }

      const decipher = crypto.createDecipheriv(this.config.algorithm, key, iv) as GCMDecipher;
      decipher.setAuthTag(authTag);
      
      // Decrypt the ciphertext
      let plaintext = decipher.update(ciphertext, 'hex', 'utf8');
      plaintext += decipher.final('utf8');
      
      return plaintext;
    } catch (error) {
      if (error instanceof PaymentEncryptionError) {
        throw error;
      }
      throw new PaymentEncryptionError(
        `Failed to decrypt data: ${error instanceof Error ? error.message : 'Unknown error'}`,
        expectedPurpose || EncryptionPurpose.PAYMENT_METADATA,
        'decrypt',
        error as Error
      );
    }
  }

  /**
   * Decrypt and parse JSON data
   */
  decryptJson<T = Record<string, unknown>>(encryptedString: string, expectedPurpose?: EncryptionPurpose): T {
    const plaintext = this.decrypt(encryptedString, expectedPurpose);
    
    try {
      return JSON.parse(plaintext) as T;
    } catch (error) {
      throw new PaymentEncryptionError(
        `Failed to parse decrypted JSON: ${error instanceof Error ? error.message : 'Unknown error'}`,
        expectedPurpose || EncryptionPurpose.PAYMENT_METADATA,
        'decrypt',
        error as Error
      );
    }
  }

  /**
   * Get purpose from prefix
   */
  private getPurposeFromPrefix(prefix: string): EncryptionPurpose {
    const prefixMap: Record<string, EncryptionPurpose> = {
      'PAY': EncryptionPurpose.PAYMENT_METADATA,
      'USE': EncryptionPurpose.USER_INFO,
      'TRA': EncryptionPurpose.TRANSACTION_DETAILS,
      'WEB': EncryptionPurpose.WEBHOOK_PAYLOAD
    };

    const purpose = prefixMap[prefix.toUpperCase()];
    if (!purpose) {
      throw new Error(`Unknown encryption purpose prefix: ${prefix}`);
    }
    
    return purpose;
  }

  /**
   * Validate if a string appears to be encrypted
   */
  isEncrypted(encryptedString: string): boolean {
    if (!encryptedString || typeof encryptedString !== 'string') {
      return false;
    }

    try {
      const parts = encryptedString.split(':');
      if (parts.length !== 4) {
        return false;
      }

      const [purposePrefix, ivHex, ciphertext, authTagHex] = parts;
      
      // Check purpose prefix format
      if (!/^[A-Z]{3}$/.test(purposePrefix)) {
        return false;
      }
      
      // Check that all parts are valid hex
      if (!/^[0-9a-fA-F]+$/.test(ivHex) || 
          !/^[0-9a-fA-F]+$/.test(ciphertext) || 
          !/^[0-9a-fA-F]+$/.test(authTagHex)) {
        return false;
      }
      
      // Check IV length
      const iv = Buffer.from(ivHex, 'hex');
      if (iv.length !== this.config.ivLength) {
        return false;
      }
      
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Encrypt sensitive fields in an object
   */
  encryptObjectFields<T extends Record<string, unknown>>(
    obj: T,
    fieldsToEncrypt: string[],
    purpose: EncryptionPurpose = EncryptionPurpose.PAYMENT_METADATA
  ): T {
    const result: Record<string, unknown> = { ...obj };
    
    for (const fieldName of fieldsToEncrypt) {
      if (fieldName in result && result[fieldName] != null) {
        const value = result[fieldName];
        
        // Only encrypt if it's a string/object and not already encrypted
        if (typeof value === 'string' || (typeof value === 'object' && value !== null)) {
          if (typeof value === 'string' && this.isEncrypted(value)) {
            // Already encrypted, skip
            continue;
          }
          
          try {
            result[fieldName] = this.encrypt(value, purpose);
          } catch (error) {
            // Log but don't fail the entire operation
            console.warn(`Failed to encrypt field ${fieldName}:`, error);
          }
        }
      }
    }
    
    return result as T;
  }

  /**
   * Decrypt encrypted fields in an object
   */
  decryptObjectFields<T extends Record<string, unknown>>(
    obj: T,
    fieldsToDecrypt: string[],
    purpose?: EncryptionPurpose
  ): T {
    const result: Record<string, unknown> = { ...obj };
    
    for (const fieldName of fieldsToDecrypt) {
      if (fieldName in result && result[fieldName] != null) {
        const value = result[fieldName];
        
        // Only decrypt if it's a string and appears to be encrypted
        if (typeof value === 'string' && this.isEncrypted(value)) {
          try {
            result[fieldName] = this.decrypt(value, purpose);
            
            // Try to parse as JSON if it looks like JSON
            const decryptedValue = result[fieldName];
            if (typeof decryptedValue === 'string' && 
                (decryptedValue.startsWith('{') || decryptedValue.startsWith('['))) {
              try {
                result[fieldName] = JSON.parse(decryptedValue);
              } catch {
                // Not JSON, keep as string
              }
            }
          } catch (error) {
            // If decryption fails, leave it encrypted and log warning
            console.warn(`Failed to decrypt field ${fieldName}:`, error);
          }
        }
      }
    }
    
    return result as T;
  }

  /**
   * Generate a new encryption key
   */
  static generateKey(): string {
    const key = crypto.randomBytes(DEFAULT_CONFIG.keyLength);
    return key.toString(DEFAULT_CONFIG.encoding);
  }

  /**
   * Generate multiple keys for different purposes
   */
  static generateKeys(): Record<EncryptionPurpose, string> {
    return {
      [EncryptionPurpose.PAYMENT_METADATA]: this.generateKey(),
      [EncryptionPurpose.USER_INFO]: this.generateKey(),
      [EncryptionPurpose.TRANSACTION_DETAILS]: this.generateKey(),
      [EncryptionPurpose.WEBHOOK_PAYLOAD]: this.generateKey()
    };
  }

  /**
   * Clear key cache (useful for testing or key rotation)
   */
  clearCache(): void {
    this.keyCache.clear();
  }
}

// Export singleton instance
export const paymentEncryptionUtils = PaymentEncryptionUtils.getInstance();

// Helper functions for common encryption tasks
export const paymentEncryption = {
  /**
   * Encrypt payment metadata (non-PCI data like phone, email references)
   */
  encryptMetadata(metadata: Record<string, unknown>): string {
    return paymentEncryptionUtils.encrypt(metadata, EncryptionPurpose.PAYMENT_METADATA);
  },

  /**
   * Decrypt payment metadata
   */
  decryptMetadata(encryptedMetadata: string): Record<string, unknown> {
    return paymentEncryptionUtils.decryptJson(encryptedMetadata, EncryptionPurpose.PAYMENT_METADATA);
  },

  /**
   * Encrypt user information (non-PCI)
   */
  encryptUserInfo(userInfo: Record<string, unknown>): string {
    return paymentEncryptionUtils.encrypt(userInfo, EncryptionPurpose.USER_INFO);
  },

  /**
   * Decrypt user information
   */
  decryptUserInfo(encryptedUserInfo: string): Record<string, unknown> {
    return paymentEncryptionUtils.decryptJson(encryptedUserInfo, EncryptionPurpose.USER_INFO);
  },

  /**
   * Encrypt transaction details
   */
  encryptTransactionDetails(details: Record<string, unknown>): string {
    return paymentEncryptionUtils.encrypt(details, EncryptionPurpose.TRANSACTION_DETAILS);
  },

  /**
   * Decrypt transaction details
   */
  decryptTransactionDetails(encryptedDetails: string): Record<string, unknown> {
    return paymentEncryptionUtils.decryptJson(encryptedDetails, EncryptionPurpose.TRANSACTION_DETAILS);
  },

  /**
   * Generate all required encryption keys for environment setup
   */
  generateEnvironmentKeys(): string {
    const keys = PaymentEncryptionUtils.generateKeys();
    
    const envLines = Object.entries(keys).map(([purpose, key]) => {
      const envVarName = paymentEncryptionUtils['getEnvKeyName'](purpose as EncryptionPurpose);
      return `${envVarName}=${key}`;
    });
    
    return envLines.join('\n');
  }
};

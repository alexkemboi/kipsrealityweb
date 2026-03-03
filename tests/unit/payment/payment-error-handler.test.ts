/**
 * Unit Tests for Payment Error Handler
 * Tests error handling, retry logic, and error classification
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { PaymentErrorHandler, PaymentError, PaymentErrorType, DEFAULT_RETRY_CONFIG } from '@/lib/payment/payment-error-handler';
import { PaymentGateway } from '@prisma/client';

describe('Payment Error Handler', () => {
  let errorHandler: PaymentErrorHandler;

  beforeEach(() => {
    errorHandler = PaymentErrorHandler.getInstance();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('PaymentError Class', () => {
    it('should create a PaymentError with default user message', () => {
      const error = new PaymentError(PaymentErrorType.NETWORK_ERROR, 'Network failed');
      
      expect(error).toBeInstanceOf(Error);
      expect(error.name).toBe('PaymentError');
      expect(error.type).toBe(PaymentErrorType.NETWORK_ERROR);
      expect(error.message).toBe('Network failed');
      expect(error.userMessage).toBe('A network error occurred. Please check your connection and try again.');
      expect(error.retryable).toBe(true);
      expect(error.shouldAlert).toBe(false);
    });

    it('should create a PaymentError with custom user message', () => {
      const error = new PaymentError(PaymentErrorType.VALIDATION_ERROR, 'Invalid phone number', {
        userMessage: 'Please enter a valid phone number'
      });
      
      expect(error.userMessage).toBe('Please enter a valid phone number');
    });

    it('should serialize to JSON correctly', () => {
      const error = new PaymentError(PaymentErrorType.FRAUD_DETECTED, 'Fraud detected', {
        transactionId: 'txn_123',
        gateway: PaymentGateway.MPESA_DIRECT
      });
      
      const json = error.toJSON();
      
      expect(json.type).toBe(PaymentErrorType.FRAUD_DETECTED);
      expect(json.message).toBe('Fraud detected');
      expect(json.userMessage).toBe('This transaction has been flagged for security review. Please contact support.');
      expect(json.retryable).toBe(false);
      expect(json.gateway).toBe(PaymentGateway.MPESA_DIRECT);
      expect(json.transactionId).toBe('txn_123');
      expect(json.timestamp).toBeDefined();
    });

    describe('Static factory methods', () => {
      it('should create network error', () => {
        const error = PaymentError.createNetworkError('Connection timeout', PaymentGateway.PAYSTACK);
        
        expect(error.type).toBe(PaymentErrorType.NETWORK_ERROR);
        expect(error.retryable).toBe(true);
        expect(error.options.gateway).toBe(PaymentGateway.PAYSTACK);
        expect(error.userMessage).toContain('Network connection failed');
      });

      it('should create authentication error', () => {
        const error = PaymentError.createAuthenticationError('Invalid credentials', PaymentGateway.STRIPE);
        
        expect(error.type).toBe(PaymentErrorType.AUTHENTICATION_ERROR);
        expect(error.retryable).toBe(false);
        expect(error.shouldAlert).toBe(true);
        expect(error.options.gateway).toBe(PaymentGateway.STRIPE);
      });

      it('should create validation error', () => {
        const error = PaymentError.createValidationError('Phone number invalid', 'phoneNumber');
        
        expect(error.type).toBe(PaymentErrorType.VALIDATION_ERROR);
        expect(error.retryable).toBe(false);
        expect(error.userMessage).toContain('phoneNumber');
      });

      it('should create fraud error', () => {
        const error = PaymentError.createFraudError('Suspicious activity', { score: 85 });
        
        expect(error.type).toBe(PaymentErrorType.FRAUD_DETECTED);
        expect(error.retryable).toBe(false);
        expect(error.shouldAlert).toBe(true);
        expect(error.options.technicalDetails).toEqual({ score: 85 });
      });

      it('should create insufficient funds error', () => {
        const error = PaymentError.createInsufficientFundsError('Balance too low');
        
        expect(error.type).toBe(PaymentErrorType.INSUFFICIENT_FUNDS);
        expect(error.retryable).toBe(false);
        expect(error.userMessage).toContain('Insufficient funds');
      });
    });
  });

  describe('Error Normalization', () => {
    it('should normalize network errors', async () => {
      const networkError = new Error('Network connection failed');
      
      // Test via withRetry
      const operation = vi.fn().mockRejectedValue(networkError);
      
      await expect(errorHandler.withRetry(operation, 'test-operation'))
        .rejects
        .toThrow();
      
      // Operation should have been called multiple times due to retry
      expect(operation).toHaveBeenCalledTimes(DEFAULT_RETRY_CONFIG.maxAttempts);
    });

    it('should normalize validation errors (non-retryable)', async () => {
      const validationError = new Error('Invalid phone number format');
      
      const operation = vi.fn().mockRejectedValue(validationError);
      
      await expect(errorHandler.withRetry(operation, 'test-operation'))
        .rejects
        .toThrow();
      
      // Validation errors are not retryable, should only be called once
      expect(operation).toHaveBeenCalledTimes(1);
    });

    it('should normalize payment gateway errors', async () => {
      const gatewayError = new Error('Paystack API failed');
      
      const operation = vi.fn().mockRejectedValue(gatewayError);
      
      await expect(errorHandler.withRetry(operation, 'test-operation'))
        .rejects
        .toThrow();
      
      // Gateway errors are retryable
      expect(operation).toHaveBeenCalledTimes(DEFAULT_RETRY_CONFIG.maxAttempts);
    });

    it('should preserve existing PaymentError instances', async () => {
      const existingError = PaymentError.createFraudError('Suspicious pattern', { rule: 'AMOUNT_THRESHOLD' });
      
      const operation = vi.fn().mockRejectedValue(existingError);
      
      await expect(errorHandler.withRetry(operation, 'test-operation'))
        .rejects
        .toThrow(PaymentError);
      
      // Fraud errors are not retryable
      expect(operation).toHaveBeenCalledTimes(1);
    });
  });

  describe('Retry Logic', () => {
    it('should retry on retryable errors', async () => {
      let attempt = 0;
      const operation = vi.fn().mockImplementation(() => {
        attempt++;
        if (attempt < 3) {
          throw new Error('Network timeout');
        }
        return 'success';
      });
      
      const result = await errorHandler.withRetry(operation, 'test-retry');
      
      expect(result).toBe('success');
      expect(operation).toHaveBeenCalledTimes(3);
    });

    it('should respect max attempts', async () => {
      const operation = vi.fn().mockRejectedValue(new Error('Network timeout'));
      
      await expect(errorHandler.withRetry(operation, 'test-max-attempts'))
        .rejects
        .toThrow();
      
      expect(operation).toHaveBeenCalledTimes(DEFAULT_RETRY_CONFIG.maxAttempts);
    });

    it('should use exponential backoff', async () => {
      const mockSleep = vi.fn();
      // @ts-ignore - accessing private method for testing
      errorHandler.sleep = mockSleep.mockResolvedValue(undefined);
      
      const operation = vi.fn()
        .mockRejectedValueOnce(new Error('First attempt'))
        .mockRejectedValueOnce(new Error('Second attempt'))
        .mockResolvedValue('Third attempt success');
      
      await errorHandler.withRetry(operation, 'test-backoff');
      
      // Should have slept between attempts
      expect(mockSleep).toHaveBeenCalledTimes(2);
      
      // Check exponential backoff delays
      const calls = mockSleep.mock.calls;
      const firstDelay = calls[0][0];
      const secondDelay = calls[1][0];
      
      expect(secondDelay).toBeGreaterThan(firstDelay);
      expect(secondDelay).toBe(firstDelay * DEFAULT_RETRY_CONFIG.backoffMultiplier);
    });

    it('should not retry non-retryable errors', async () => {
      const operation = vi.fn().mockRejectedValue(new Error('Invalid input data'));
      
      await expect(errorHandler.withRetry(operation, 'test-non-retryable'))
        .rejects
        .toThrow();
      
      // Should only be called once
      expect(operation).toHaveBeenCalledTimes(1);
    });

    it('should allow custom retry config', async () => {
      const customConfig = {
        maxAttempts: 2,
        baseDelay: 500,
        backoffMultiplier: 1.5
      };
      
      const operation = vi.fn().mockRejectedValue(new Error('Network error'));
      
      await expect(errorHandler.withRetry(operation, 'test-custom-config', customConfig))
        .rejects
        .toThrow();
      
      expect(operation).toHaveBeenCalledTimes(2);
    });
  });

  describe('Error Classification', () => {
    it('should classify network-related errors', () => {
      const errors = [
        'Network connection failed',
        'fetch failed',
        'connection timeout',
        'socket hang up'
      ];
      
      errors.forEach(errorMessage => {
        const error = new Error(errorMessage);
        // @ts-ignore - accessing private method for testing
        const normalized = errorHandler.normalizeError(error, 'test');
        
        expect(normalized.type).toBe(PaymentErrorType.NETWORK_ERROR);
        expect(normalized.retryable).toBe(true);
      });
    });

    it('should classify authentication errors', () => {
      const errors = [
        'Unauthorized access',
        'Invalid credentials',
        'Auth token expired',
        'Authentication failed'
      ];
      
      errors.forEach(errorMessage => {
        const error = new Error(errorMessage);
        // @ts-ignore - accessing private method for testing
        const normalized = errorHandler.normalizeError(error, 'test');
        
        expect(normalized.type).toBe(PaymentErrorType.AUTHENTICATION_ERROR);
        expect(normalized.retryable).toBe(false);
        expect(normalized.shouldAlert).toBe(true);
      });
    });

    it('should classify validation errors', () => {
      const errors = [
        'Invalid phone number',
        'Validation failed: email required',
        'Required field missing',
        'Invalid format'
      ];
      
      errors.forEach(errorMessage => {
        const error = new Error(errorMessage);
        // @ts-ignore - accessing private method for testing
        const normalized = errorHandler.normalizeError(error, 'test');
        
        expect(normalized.type).toBe(PaymentErrorType.VALIDATION_ERROR);
        expect(normalized.retryable).toBe(false);
      });
    });

    it('should classify payment gateway errors', () => {
      const gatewayTests = [
        { message: 'Paystack API error', expectedGateway: PaymentGateway.PAYSTACK },
        { message: 'Stripe declined', expectedGateway: PaymentGateway.STRIPE },
        { message: 'M-Pesa failed', expectedGateway: PaymentGateway.MPESA_DIRECT },
        { message: 'Gateway timeout', expectedGateway: undefined }
      ];
      
      gatewayTests.forEach(({ message, expectedGateway }) => {
        const error = new Error(message);
        // @ts-ignore - accessing private method for testing
        const normalized = errorHandler.normalizeError(error, 'test');
        
        expect(normalized.type).toBe(PaymentErrorType.PAYMENT_GATEWAY_ERROR);
        expect(normalized.retryable).toBe(true);
        expect(normalized.options.gateway).toBe(expectedGateway);
      });
    });

    it('should classify fraud detection errors', () => {
      const errors = [
        'Fraud detected',
        'Suspicious transaction',
        'Potential fraud attempt'
      ];
      
      errors.forEach(errorMessage => {
        const error = new Error(errorMessage);
        // @ts-ignore - accessing private method for testing
        const normalized = errorHandler.normalizeError(error, 'test');
        
        expect(normalized.type).toBe(PaymentErrorType.FRAUD_DETECTED);
        expect(normalized.retryable).toBe(false);
        expect(normalized.shouldAlert).toBe(true);
      });
    });
  });

  describe('Singleton Pattern', () => {
    it('should return same instance', () => {
      const instance1 = PaymentErrorHandler.getInstance();
      const instance2 = PaymentErrorHandler.getInstance();
      
      expect(instance1).toBe(instance2);
    });

    it('should allow custom config on first instantiation', () => {
      const customConfig = {
        maxAttempts: 5,
        baseDelay: 2000,
        backoffMultiplier: 3,
        maxDelay: 30000,
        retryableErrorTypes: [PaymentErrorType.NETWORK_ERROR]
      };
      
      // Reset singleton for test
      // @ts-ignore - accessing private static field
      PaymentErrorHandler.instance = undefined;
      
      const customInstance = PaymentErrorHandler.getInstance(customConfig);
      const defaultInstance = PaymentErrorHandler.getInstance();
      
      expect(customInstance).toBe(defaultInstance);
    });
  });
});
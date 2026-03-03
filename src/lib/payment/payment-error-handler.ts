/**
 * Payment Error Handling with Retry Logic
 * Provides standardized error handling, retry mechanisms, and user-friendly messages for payment operations
 */

import { PaymentGateway, TransactionStatus } from '@prisma/client';

export enum PaymentErrorType {
  NETWORK_ERROR = 'NETWORK_ERROR',
  AUTHENTICATION_ERROR = 'AUTHENTICATION_ERROR',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  PAYMENT_GATEWAY_ERROR = 'PAYMENT_GATEWAY_ERROR',
  FRAUD_DETECTED = 'FRAUD_DETECTED',
  INSUFFICIENT_FUNDS = 'INSUFFICIENT_FUNDS',
  TIMEOUT_ERROR = 'TIMEOUT_ERROR',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR'
}

export class PaymentError extends Error {
  constructor(
    public readonly type: PaymentErrorType,
    message: string,
    public readonly options: {
      userMessage?: string;
      retryable?: boolean;
      gateway?: PaymentGateway;
      transactionId?: string;
      technicalDetails?: Record<string, unknown>;
      shouldAlert?: boolean;
    } = {}
  ) {
    super(message);
    this.name = 'PaymentError';
  }

  get userMessage(): string {
    return this.options.userMessage || this.getDefaultUserMessage();
  }

  get retryable(): boolean {
    return this.options.retryable ?? this.isRetryableByDefault();
  }

  get shouldAlert(): boolean {
    return this.options.shouldAlert ?? this.shouldAlertByDefault();
  }

  private getDefaultUserMessage(): string {
    const messages: Record<PaymentErrorType, string> = {
      [PaymentErrorType.NETWORK_ERROR]: 'A network error occurred. Please check your connection and try again.',
      [PaymentErrorType.AUTHENTICATION_ERROR]: 'Payment authentication failed. Please try again or contact support.',
      [PaymentErrorType.VALIDATION_ERROR]: 'Please check your payment information and try again.',
      [PaymentErrorType.PAYMENT_GATEWAY_ERROR]: 'The payment service is temporarily unavailable. Please try again later.',
      [PaymentErrorType.FRAUD_DETECTED]: 'This transaction has been flagged for security review. Please contact support.',
      [PaymentErrorType.INSUFFICIENT_FUNDS]: 'Insufficient funds. Please check your account balance.',
      [PaymentErrorType.TIMEOUT_ERROR]: 'The payment request timed out. Please try again.',
      [PaymentErrorType.UNKNOWN_ERROR]: 'An unexpected error occurred. Please try again or contact support.'
    };
    return messages[this.type];
  }

  private isRetryableByDefault(): boolean {
    const retryableTypes: PaymentErrorType[] = [
      PaymentErrorType.NETWORK_ERROR,
      PaymentErrorType.TIMEOUT_ERROR,
      PaymentErrorType.PAYMENT_GATEWAY_ERROR
    ];
    return retryableTypes.includes(this.type);
  }

  private shouldAlertByDefault(): boolean {
    const alertTypes: PaymentErrorType[] = [
      PaymentErrorType.FRAUD_DETECTED,
      PaymentErrorType.AUTHENTICATION_ERROR,
      PaymentErrorType.PAYMENT_GATEWAY_ERROR
    ];
    return alertTypes.includes(this.type);
  }

  toJSON() {
    return {
      type: this.type,
      message: this.message,
      userMessage: this.userMessage,
      retryable: this.retryable,
      gateway: this.options.gateway,
      transactionId: this.options.transactionId,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Creates specific error types for common payment scenarios
   */
  static createNetworkError(message: string, gateway?: PaymentGateway): PaymentError {
    return new PaymentError(PaymentErrorType.NETWORK_ERROR, message, {
      userMessage: 'Network connection failed. Please check your internet connection and try again.',
      retryable: true,
      gateway
    });
  }

  static createAuthenticationError(message: string, gateway?: PaymentGateway): PaymentError {
    return new PaymentError(PaymentErrorType.AUTHENTICATION_ERROR, message, {
      userMessage: 'Payment authentication failed. Please check your payment details or contact support.',
      retryable: false,
      gateway,
      shouldAlert: true
    });
  }

  static createValidationError(message: string, field?: string): PaymentError {
    return new PaymentError(PaymentErrorType.VALIDATION_ERROR, message, {
      userMessage: field 
        ? `Please check the ${field} field and try again.`
        : 'Please check your payment information and try again.',
      retryable: false
    });
  }

  static createFraudError(message: string, details?: Record<string, unknown>): PaymentError {
    return new PaymentError(PaymentErrorType.FRAUD_DETECTED, message, {
      userMessage: 'This transaction has been flagged for security review. Please contact support if you believe this is an error.',
      retryable: false,
      shouldAlert: true,
      technicalDetails: details
    });
  }

  static createInsufficientFundsError(message: string): PaymentError {
    return new PaymentError(PaymentErrorType.INSUFFICIENT_FUNDS, message, {
      userMessage: 'Insufficient funds. Please check your account balance and try again.',
      retryable: false
    });
  }
}

// Retry configuration
export interface RetryConfig {
  maxAttempts: number;
  baseDelay: number; // milliseconds
  backoffMultiplier: number;
  maxDelay: number; // milliseconds
  retryableErrorTypes: PaymentErrorType[];
}

export const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxAttempts: 3,
  baseDelay: 1000,
  backoffMultiplier: 2,
  maxDelay: 10000,
  retryableErrorTypes: [
    PaymentErrorType.NETWORK_ERROR,
    PaymentErrorType.TIMEOUT_ERROR,
    PaymentErrorType.PAYMENT_GATEWAY_ERROR
  ]
};

export class PaymentErrorHandler {
  private static instance: PaymentErrorHandler;
  private retryConfig: RetryConfig;

  private constructor(retryConfig: RetryConfig = DEFAULT_RETRY_CONFIG) {
    this.retryConfig = retryConfig;
  }

  public static getInstance(retryConfig?: RetryConfig): PaymentErrorHandler {
    if (!PaymentErrorHandler.instance) {
      PaymentErrorHandler.instance = new PaymentErrorHandler(retryConfig);
    }
    return PaymentErrorHandler.instance;
  }

  /**
   * Wraps an async payment operation with error handling and retry logic
   */
  public async withRetry<T>(
    operation: () => Promise<T>,
    context: string,
    customConfig?: Partial<RetryConfig>
  ): Promise<T> {
    const config = { ...this.retryConfig, ...customConfig };
    let lastError: Error;

    for (let attempt = 1; attempt <= config.maxAttempts; attempt++) {
      try {
        return await operation();
      } catch (error: unknown) {
        lastError = error as Error;
        
        // Convert generic errors to PaymentError if needed
        const paymentError = this.normalizeError(error, context);
        
        // Check if we should retry
        if (
          attempt < config.maxAttempts &&
          paymentError.retryable &&
          config.retryableErrorTypes.includes(paymentError.type)
        ) {
          const delay = this.calculateDelay(attempt, config);
          console.warn(`Payment operation failed (attempt ${attempt}/${config.maxAttempts}), retrying in ${delay}ms:`, {
            context,
            error: paymentError.message,
            type: paymentError.type,
            retryable: paymentError.retryable
          });
          
          await this.sleep(delay);
          continue;
        }
        
        // Log the final error
        this.logError(paymentError, context, attempt);
        
        // Re-throw the normalized error
        throw paymentError;
      }
    }

    // This should never be reached due to the throw above, but TypeScript needs it
    throw lastError!;
  }

  /**
   * Normalizes various error types to PaymentError
   */
  private normalizeError(error: unknown, context: string): PaymentError {
    // If it's already a PaymentError, return it
    if (error instanceof PaymentError) {
      return error;
    }

    const err = error as Error;
    const errorMessage = err.message || 'Unknown error';
    
    // Determine error type based on message patterns
    let type = PaymentErrorType.UNKNOWN_ERROR;
    let gateway: PaymentGateway | undefined;
    let retryable = false;

    // Network errors
    if (
      errorMessage.includes('network') ||
      errorMessage.includes('fetch') ||
      errorMessage.includes('connection')
    ) {
      type = PaymentErrorType.NETWORK_ERROR;
      retryable = true;
    }
    // Timeout errors
    else if (errorMessage.includes('timeout') || errorMessage.includes('timed out')) {
      type = PaymentErrorType.TIMEOUT_ERROR;
      retryable = true;
    }
    // Authentication errors
    else if (
      errorMessage.includes('auth') ||
      errorMessage.includes('unauthorized') ||
      errorMessage.includes('invalid credentials')
    ) {
      type = PaymentErrorType.AUTHENTICATION_ERROR;
    }
    // Validation errors
    else if (
      errorMessage.includes('invalid') ||
      errorMessage.includes('validation') ||
      errorMessage.includes('required')
    ) {
      type = PaymentErrorType.VALIDATION_ERROR;
    }
    // Payment gateway errors
    else if (
      errorMessage.includes('paystack') ||
      errorMessage.includes('stripe') ||
      errorMessage.includes('mpesa') ||
      errorMessage.includes('gateway')
    ) {
      type = PaymentErrorType.PAYMENT_GATEWAY_ERROR;
      retryable = true;
      
      // Determine gateway
      if (errorMessage.toLowerCase().includes('paystack')) {
        gateway = PaymentGateway.PAYSTACK;
      } else if (errorMessage.toLowerCase().includes('stripe')) {
        gateway = PaymentGateway.STRIPE;
      } else if (errorMessage.toLowerCase().includes('mpesa')) {
        gateway = PaymentGateway.MPESA_DIRECT;
      }
    }
    // Fraud detection
    else if (errorMessage.includes('fraud') || errorMessage.includes('suspicious')) {
      type = PaymentErrorType.FRAUD_DETECTED;
    }
    // Insufficient funds
    else if (errorMessage.includes('insufficient') || errorMessage.includes('funds')) {
      type = PaymentErrorType.INSUFFICIENT_FUNDS;
    }

    return new PaymentError(type, errorMessage, {
      userMessage: this.getUserErrorMessage(type, context),
      retryable,
      gateway,
      technicalDetails: {
        originalError: errorMessage,
        stack: err.stack,
        context
      }
    });
  }

  private getUserErrorMessage(type: PaymentErrorType, context: string): string {
    // Customize based on context if needed
    const baseMessage = new PaymentError(type, '').userMessage;
    
    if (context.includes('initialization') || context.includes('initialize')) {
      return `Failed to start payment: ${baseMessage.toLowerCase()}`;
    }
    
    if (context.includes('verification') || context.includes('verify')) {
      return `Failed to verify payment: ${baseMessage.toLowerCase()}`;
    }
    
    return baseMessage;
  }

  private calculateDelay(attempt: number, config: RetryConfig): number {
    const delay = config.baseDelay * Math.pow(config.backoffMultiplier, attempt - 1);
    return Math.min(delay, config.maxDelay);
  }

  private async sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private logError(error: PaymentError, context: string, attempt: number): void {
    const logLevel = error.shouldAlert ? 'error' : 'warn';
    
    console[logLevel](`Payment operation failed after ${attempt} attempt(s):`, {
      context,
      errorType: error.type,
      message: error.message,
      userMessage: error.userMessage,
      retryable: error.retryable,
      gateway: error.options.gateway,
      transactionId: error.options.transactionId,
      shouldAlert: error.shouldAlert,
      timestamp: new Date().toISOString()
    });

    // In production, you would send alerts to monitoring system
    if (error.shouldAlert) {
      this.sendAlert(error, context);
    }
  }

  private sendAlert(error: PaymentError, context: string): void {
    // This would integrate with your alerting system (Sentry, PagerDuty, etc.)
    console.error('ALERT: Payment error requiring attention:', {
      errorType: error.type,
      context,
      message: error.message,
      gateway: error.options.gateway,
      timestamp: new Date().toISOString()
    });
  }

}

// Export singleton instance
export const paymentErrorHandler = PaymentErrorHandler.getInstance();

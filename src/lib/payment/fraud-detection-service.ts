/**
 * Fraud Detection Service
 * Provides basic fraud detection rules for payment transactions
 */

import { PaymentRequest, PaymentResult } from './types';
import { PaymentError, PaymentErrorType } from './payment-error-handler';

export interface FraudDetectionRule {
  name: string;
  description: string;
  check: (request: PaymentRequest, context: FraudDetectionContext) => Promise<FraudDetectionResult>;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  enabled: boolean;
}

export interface FraudDetectionContext {
  userId: string;
  userEmail: string;
  userIp?: string;
  userAgent?: string;
  previousTransactions: TransactionHistory[];
  organizationId: string;
  timestamp: Date;
}

export interface TransactionHistory {
  id: string;
  amount: number;
  currency: string;
  status: string;
  gateway: string;
  timestamp: Date;
  metadata?: Record<string, unknown>;
}

export interface FraudDetectionResult {
  passed: boolean;
  ruleName: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  message: string;
  details?: Record<string, unknown>;
  score: number; // 0-100, higher = more suspicious
}

export interface FraudDetectionReport {
  transactionId: string;
  overallScore: number;
  passed: boolean;
  rulesChecked: number;
  rulesFailed: number;
  results: FraudDetectionResult[];
  timestamp: Date;
  recommendation: 'ALLOW' | 'REVIEW' | 'BLOCK';
  [key: string]: unknown; // Index signature to allow additional properties
}

export class FraudDetectionService {
  private rules: FraudDetectionRule[] = [];

  constructor() {
    this.initializeDefaultRules();
  }

  /**
   * Initialize default fraud detection rules
   */
  private initializeDefaultRules(): void {
    this.rules = [
      {
        name: 'AMOUNT_THRESHOLD',
        description: 'Check if transaction amount exceeds typical limits',
        check: this.checkAmountThreshold.bind(this),
        severity: 'MEDIUM',
        enabled: true
      },
      {
        name: 'RAPID_SUCCESSIVE_TRANSACTIONS',
        description: 'Detect multiple transactions in short time period',
        check: this.checkRapidTransactions.bind(this),
        severity: 'HIGH',
        enabled: true
      },
      {
        name: 'UNUSUAL_TIME',
        description: 'Check if transaction occurs at unusual hours',
        check: this.checkUnusualTime.bind(this),
        severity: 'LOW',
        enabled: true
      },
      {
        name: 'EMAIL_DOMAIN_VALIDATION',
        description: 'Validate email domain for suspicious patterns',
        check: this.checkEmailDomain.bind(this),
        severity: 'LOW',
        enabled: true
      },
      {
        name: 'IP_GEO_LOCATION',
        description: 'Check if IP location matches user profile region',
        check: this.checkIpLocation.bind(this),
        severity: 'MEDIUM',
        enabled: false // Requires IP geolocation service
      },
      {
        name: 'DEVICE_FINGERPRINT',
        description: 'Check for unusual device patterns',
        check: this.checkDeviceFingerprint.bind(this),
        severity: 'MEDIUM',
        enabled: false // Requires device fingerprinting
      },
      {
        name: 'CURRENCY_MISMATCH',
        description: 'Check if currency matches user/organization region',
        check: this.checkCurrencyMismatch.bind(this),
        severity: 'LOW',
        enabled: true
      },
      {
        name: 'AVS_CHECK',
        description: 'Address Verification System check (if applicable)',
        check: this.checkAvs.bind(this),
        severity: 'HIGH',
        enabled: false // Requires AVS integration
      },
      {
        name: 'BLACKLIST_CHECK',
        description: 'Check against known fraudster lists',
        check: this.checkBlacklist.bind(this),
        severity: 'CRITICAL',
        enabled: false // Requires blacklist database
      }
    ];
  }

  /**
   * Check payment request for fraud indicators
   */
  async checkPayment(
    request: PaymentRequest,
    context: FraudDetectionContext
  ): Promise<FraudDetectionReport> {
    const results: FraudDetectionResult[] = [];
    let totalScore = 0;
    let rulesChecked = 0;
    let rulesFailed = 0;

    // Run all enabled rules
    for (const rule of this.rules) {
      if (!rule.enabled) continue;

      rulesChecked++;
      
      try {
        const result = await rule.check(request, context);
        results.push(result);

        if (!result.passed) {
          rulesFailed++;
          totalScore += result.score * this.getSeverityMultiplier(rule.severity);
        }
      } catch (error) {
        // Rule execution error - log but don't fail the whole check
        console.warn(`Fraud rule ${rule.name} execution failed:`, error);
      }
    }

    // Calculate overall score (0-100)
    const overallScore = Math.min(100, totalScore);
    
    // Determine recommendation
    const recommendation = this.getRecommendation(overallScore, rulesFailed);

    return {
      transactionId: request.invoiceId,
      overallScore,
      passed: recommendation === 'ALLOW',
      rulesChecked,
      rulesFailed,
      results,
      timestamp: new Date(),
      recommendation
    };
  }

  /**
   * Get recommendation based on fraud score
   */
  private getRecommendation(score: number, rulesFailed: number): 'ALLOW' | 'REVIEW' | 'BLOCK' {
    if (rulesFailed === 0) return 'ALLOW';
    
    if (score >= 80) return 'BLOCK';
    if (score >= 50) return 'REVIEW';
    
    return 'ALLOW';
  }

  /**
   * Get severity multiplier for score calculation
   */
  private getSeverityMultiplier(severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'): number {
    switch (severity) {
      case 'LOW': return 0.5;
      case 'MEDIUM': return 1.0;
      case 'HIGH': return 2.0;
      case 'CRITICAL': return 5.0;
    }
  }

  /**
   * Rule: Check if transaction amount exceeds typical limits
   */
  private async checkAmountThreshold(
    request: PaymentRequest,
    context: FraudDetectionContext
  ): Promise<FraudDetectionResult> {
    const typicalMaxAmount = 500000; // 500,000 KES / 5,000 USD
    const amount = request.amount;
    const currency = request.currency;
    
    let passed = true;
    let score = 0;
    let message = `Amount ${amount} ${currency} is within typical limits`;
    
    if (amount > typicalMaxAmount) {
      passed = false;
      score = 70; // High score for large amounts
      message = `Amount ${amount} ${currency} exceeds typical maximum (${typicalMaxAmount} ${currency})`;
    } else if (amount > typicalMaxAmount * 0.8) {
      passed = false;
      score = 40; // Medium score for near-limit amounts
      message = `Amount ${amount} ${currency} is approaching typical maximum`;
    }

    // Check for micro-transactions (potential testing)
    if (amount < 10) {
      passed = false;
      score = Math.max(score, 30);
      message = `Small transaction amount ${amount} ${currency} detected`;
    }

    return {
      passed,
      ruleName: 'AMOUNT_THRESHOLD',
      severity: 'MEDIUM',
      message,
      details: { amount, currency, typicalMaxAmount },
      score
    };
  }

  /**
   * Rule: Detect multiple transactions in short time period
   */
  private async checkRapidTransactions(
    request: PaymentRequest,
    context: FraudDetectionContext
  ): Promise<FraudDetectionResult> {
    const recentTransactions = context.previousTransactions.filter(tx => {
      const timeDiff = Date.now() - tx.timestamp.getTime();
      return timeDiff < 5 * 60 * 1000; // Last 5 minutes
    });

    const passed = recentTransactions.length < 3;
    const score = Math.min(100, recentTransactions.length * 25);
    
    return {
      passed,
      ruleName: 'RAPID_SUCCESSIVE_TRANSACTIONS',
      severity: 'HIGH',
      message: passed 
        ? `User has ${recentTransactions.length} recent transactions (acceptable)`
        : `User has ${recentTransactions.length} recent transactions in last 5 minutes (suspicious)`,
      details: {
        recentTransactionCount: recentTransactions.length,
        timeWindow: '5 minutes',
        transactionIds: recentTransactions.map(tx => tx.id)
      },
      score
    };
  }

  /**
   * Rule: Check if transaction occurs at unusual hours
   */
  private async checkUnusualTime(
    request: PaymentRequest,
    context: FraudDetectionContext
  ): Promise<FraudDetectionResult> {
    const now = new Date();
    const hour = now.getHours();
    
    // Normal business hours: 8 AM - 8 PM
    const isUnusualHour = hour < 8 || hour > 20;
    
    let passed = !isUnusualHour;
    let score = 0;
    let message = `Transaction time ${hour}:00 is within normal hours`;
    
    if (isUnusualHour) {
      passed = false;
      score = 30;
      message = `Transaction time ${hour}:00 is outside normal business hours (8 AM - 8 PM)`;
    }

    // Weekend check
    const isWeekend = now.getDay() === 0 || now.getDay() === 6; // 0 = Sunday, 6 = Saturday
    if (isWeekend) {
      passed = false;
      score = Math.max(score, 20);
      message = `${message} and occurs on a weekend`;
    }

    return {
      passed,
      ruleName: 'UNUSUAL_TIME',
      severity: 'LOW',
      message,
      details: { hour, isWeekend, timestamp: now.toISOString() },
      score
    };
  }

  /**
   * Rule: Validate email domain for suspicious patterns
   */
  private async checkEmailDomain(
    request: PaymentRequest,
    context: FraudDetectionContext
  ): Promise<FraudDetectionResult> {
    const email = request.user.email.toLowerCase();
    const domain = email.split('@')[1] || '';
    
    // List of suspicious/disposable email domains
    const suspiciousDomains = [
      'tempmail.com', 'guerrillamail.com', 'mailinator.com', '10minutemail.com',
      'yopmail.com', 'trashmail.com', 'dispostable.com', 'fakeinbox.com',
      'throwawaymail.com', 'temp-mail.org'
    ];
    
    // List of public/free email domains (less suspicious but worth noting)
    const freeDomains = [
      'gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 'aol.com',
      'protonmail.com', 'zoho.com', 'mail.com', 'yandex.com'
    ];
    
    let passed = true;
    let score = 0;
    let message = `Email domain ${domain} appears legitimate`;
    
    if (suspiciousDomains.includes(domain)) {
      passed = false;
      score = 80;
      message = `Email domain ${domain} is associated with disposable/temporary email services`;
    } else if (freeDomains.includes(domain)) {
      passed = false;
      score = 20;
      message = `Email domain ${domain} is a free/public email service`;
    }

    // Check for suspicious patterns in email
    const suspiciousPatterns = [
      /^\d+@/, // Email starts with numbers
      /test/, // Contains "test"
      /fake/, // Contains "fake"
      /temp/, // Contains "temp"
    ];

    for (const pattern of suspiciousPatterns) {
      if (pattern.test(email)) {
        passed = false;
        score = Math.max(score, 40);
        message = `Email contains suspicious pattern: ${pattern}`;
        break;
      }
    }

    return {
      passed,
      ruleName: 'EMAIL_DOMAIN_VALIDATION',
      severity: 'LOW',
      message,
      details: { email, domain, isSuspiciousDomain: suspiciousDomains.includes(domain) },
      score
    };
  }

  /**
   * Rule: Check if IP location matches user profile region
   */
  private async checkIpLocation(
    request: PaymentRequest,
    context: FraudDetectionContext
  ): Promise<FraudDetectionResult> {
    // This rule requires integration with IP geolocation service
    // For now, return neutral result
    return {
      passed: true,
      ruleName: 'IP_GEO_LOCATION',
      severity: 'MEDIUM',
      message: 'IP geolocation check not enabled',
      details: { note: 'Requires IP geolocation service integration' },
      score: 0
    };
  }

  /**
   * Rule: Check for unusual device patterns
   */
  private async checkDeviceFingerprint(
    request: PaymentRequest,
    context: FraudDetectionContext
  ): Promise<FraudDetectionResult> {
    // This rule requires device fingerprinting
    // For now, return neutral result
    return {
      passed: true,
      ruleName: 'DEVICE_FINGERPRINT',
      severity: 'MEDIUM',
      message: 'Device fingerprint check not enabled',
      details: { note: 'Requires device fingerprinting integration' },
      score: 0
    };
  }

  /**
   * Rule: Check if currency matches user/organization region
   */
  private async checkCurrencyMismatch(
    request: PaymentRequest,
    context: FraudDetectionContext
  ): Promise<FraudDetectionResult> {
    const userRegion = request.user.region;
    const organizationRegion = request.organization.region;
    const transactionCurrency = request.currency;
    
    const expectedCurrencies: Record<string, string> = {
      'KEN': 'KES',
      'USA': 'USD',
      'GBR': 'GBP',
      'EUR': 'EUR'
    };
    
    // Handle nullable regions
    const orgRegionKey = organizationRegion || '';
    const userRegionKey = userRegion || '';
    
    const expectedCurrency = expectedCurrencies[orgRegionKey] || expectedCurrencies[userRegionKey] || 'KES';
    
    const passed = transactionCurrency === expectedCurrency;
    const score = passed ? 0 : 40;
    
    return {
      passed,
      ruleName: 'CURRENCY_MISMATCH',
      severity: 'LOW',
      message: passed
        ? `Currency ${transactionCurrency} matches expected currency for region`
        : `Currency ${transactionCurrency} does not match expected currency ${expectedCurrency} for region ${organizationRegion || userRegion || 'unknown'}`,
      details: {
        userRegion,
        organizationRegion,
        transactionCurrency,
        expectedCurrency
      },
      score
    };
  }

  /**
   * Rule: Address Verification System check
   */
  private async checkAvs(
    request: PaymentRequest,
    context: FraudDetectionContext
  ): Promise<FraudDetectionResult> {
    // This rule requires AVS integration with payment gateway
    // For now, return neutral result
    return {
      passed: true,
      ruleName: 'AVS_CHECK',
      severity: 'HIGH',
      message: 'AVS check not enabled',
      details: { note: 'Requires AVS integration with payment gateway' },
      score: 0
    };
  }

  /**
   * Rule: Check against known fraudster lists
   */
  private async checkBlacklist(
    request: PaymentRequest,
    context: FraudDetectionContext
  ): Promise<FraudDetectionResult> {
    // This rule requires blacklist database
    // For now, return neutral result
    return {
      passed: true,
      ruleName: 'BLACKLIST_CHECK',
      severity: 'CRITICAL',
      message: 'Blacklist check not enabled',
      details: { note: 'Requires blacklist database integration' },
      score: 0
    };
  }

  /**
   * Enable/disable specific rule
   */
  setRuleEnabled(ruleName: string, enabled: boolean): void {
    const rule = this.rules.find(r => r.name === ruleName);
    if (rule) {
      rule.enabled = enabled;
    }
  }

  /**
   * Get all rules with their current status
   */
  getRules(): FraudDetectionRule[] {
    return [...this.rules];
  }

  /**
   * Add custom rule
   */
  addRule(rule: FraudDetectionRule): void {
    this.rules.push(rule);
  }

  /**
   * Remove rule by name
   */
  removeRule(ruleName: string): void {
    this.rules = this.rules.filter(r => r.name !== ruleName);
  }
}

// Export singleton instance
export const fraudDetectionService = new FraudDetectionService();

/**
 * Middleware to integrate fraud detection with payment flow
 */
export async function checkForFraud(
  paymentRequest: PaymentRequest,
  context: Partial<FraudDetectionContext>
): Promise<void> {
  const defaultContext: FraudDetectionContext = {
    userId: paymentRequest.user.id,
    userEmail: paymentRequest.user.email,
    previousTransactions: [],
    organizationId: paymentRequest.organization.id,
    timestamp: new Date(),
    ...context
  };

  const report = await fraudDetectionService.checkPayment(paymentRequest, defaultContext);

  console.log('Fraud Detection Report:', {
    transactionId: report.transactionId,
    overallScore: report.overallScore,
    recommendation: report.recommendation,
    rulesChecked: report.rulesChecked,
    rulesFailed: report.rulesFailed
  });

  // Take action based on recommendation
  switch (report.recommendation) {
    case 'BLOCK':
      throw PaymentError.createFraudError(
        `Transaction blocked by fraud detection: overall score ${report.overallScore}`,
        report
      );
    case 'REVIEW':
      // Log for manual review but allow transaction to proceed
      console.warn('Transaction flagged for manual review:', {
        transactionId: report.transactionId,
        score: report.overallScore,
        failedRules: report.results.filter(r => !r.passed).map(r => r.ruleName)
      });
      break;
    case 'ALLOW':
      // Transaction is clean, proceed normally
      break;
  }
}
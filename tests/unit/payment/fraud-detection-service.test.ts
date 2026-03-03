/**
 * Unit Tests for Fraud Detection Service
 * Tests fraud detection rules, scoring, and decision making
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { fraudDetectionService, FraudDetectionService, FraudDetectionContext } from '@/lib/payment/fraud-detection-service';
import { PaymentRequest } from '@/lib/payment/types';

describe('Fraud Detection Service', () => {
  let service: FraudDetectionService;
  let mockContext: FraudDetectionContext;
  let mockPaymentRequest: PaymentRequest;

  beforeEach(() => {
    service = new FraudDetectionService();
    
    mockContext = {
      userId: 'user-123',
      userEmail: 'test@example.com',
      previousTransactions: [],
      organizationId: 'org-456',
      timestamp: new Date()
    };

    mockPaymentRequest = {
      user: {
        id: 'user-123',
        email: 'test@example.com',
        phone: '254712345678',
        firstName: 'Test',
        lastName: 'User',
        region: 'KEN',
        KycStatus: 'PENDING',
        stripeCustomerId: null,
        plaidAccessTokenEncrypted: null,
        paystackCustomerCode: null,
        paymentMethods: []
      } as any,
      organization: {
        id: 'org-456',
        name: 'Test Org',
        region: 'KEN',
        paystackSubaccountCode: 'test-subaccount',
        stripeConnectId: null
      } as any,
      amount: 1500,
      currency: 'KES',
      invoiceId: 'inv-789',
      metadata: {}
    };
  });

  describe('Rule: Amount Threshold', () => {
    it('should pass for normal amounts', async () => {
      mockPaymentRequest.amount = 10000; // 10,000 KES
      
      const report = await service.checkPayment(mockPaymentRequest, mockContext);
      const amountRule = report.results.find(r => r.ruleName === 'AMOUNT_THRESHOLD');
      
      expect(amountRule).toBeDefined();
      expect(amountRule?.passed).toBe(true);
      expect(amountRule?.score).toBe(0);
    });

    it('should fail for amounts exceeding typical maximum', async () => {
      mockPaymentRequest.amount = 600000; // 600,000 KES (exceeds 500,000)
      
      const report = await service.checkPayment(mockPaymentRequest, mockContext);
      const amountRule = report.results.find(r => r.ruleName === 'AMOUNT_THRESHOLD');
      
      expect(amountRule?.passed).toBe(false);
      expect(amountRule?.score).toBe(70);
      expect(amountRule?.message).toContain('exceeds typical maximum');
    });

    it('should flag near-limit amounts', async () => {
      mockPaymentRequest.amount = 450000; // 450,000 KES (90% of 500,000)
      
      const report = await service.checkPayment(mockPaymentRequest, mockContext);
      const amountRule = report.results.find(r => r.ruleName === 'AMOUNT_THRESHOLD');
      
      expect(amountRule?.passed).toBe(false);
      expect(amountRule?.score).toBe(40);
      expect(amountRule?.message).toContain('approaching typical maximum');
    });

    it('should flag micro-transactions', async () => {
      mockPaymentRequest.amount = 5; // 5 KES
      
      const report = await service.checkPayment(mockPaymentRequest, mockContext);
      const amountRule = report.results.find(r => r.ruleName === 'AMOUNT_THRESHOLD');
      
      expect(amountRule?.passed).toBe(false);
      expect(amountRule?.score).toBe(30);
      expect(amountRule?.message).toContain('Small transaction amount');
    });
  });

  describe('Rule: Rapid Successive Transactions', () => {
    it('should pass for normal transaction frequency', async () => {
      mockContext.previousTransactions = [
        {
          id: 'txn-1',
          amount: 1000,
          currency: 'KES',
          status: 'COMPLETED',
          gateway: 'PAYSTACK',
          timestamp: new Date(Date.now() - 10 * 60 * 1000) // 10 minutes ago
        }
      ];
      
      const report = await service.checkPayment(mockPaymentRequest, mockContext);
      const rapidRule = report.results.find(r => r.ruleName === 'RAPID_SUCCESSIVE_TRANSACTIONS');
      
      expect(rapidRule?.passed).toBe(true);
    });

    it('should fail for multiple recent transactions', async () => {
      mockContext.previousTransactions = [
        {
          id: 'txn-1',
          amount: 1000,
          currency: 'KES',
          status: 'COMPLETED',
          gateway: 'PAYSTACK',
          timestamp: new Date(Date.now() - 1 * 60 * 1000) // 1 minute ago
        },
        {
          id: 'txn-2',
          amount: 2000,
          currency: 'KES',
          status: 'COMPLETED',
          gateway: 'PAYSTACK',
          timestamp: new Date(Date.now() - 2 * 60 * 1000) // 2 minutes ago
        },
        {
          id: 'txn-3',
          amount: 3000,
          currency: 'KES',
          status: 'COMPLETED',
          gateway: 'PAYSTACK',
          timestamp: new Date(Date.now() - 3 * 60 * 1000) // 3 minutes ago
        }
      ];
      
      const report = await service.checkPayment(mockPaymentRequest, mockContext);
      const rapidRule = report.results.find(r => r.ruleName === 'RAPID_SUCCESSIVE_TRANSACTIONS');
      
      expect(rapidRule?.passed).toBe(false);
      expect(rapidRule?.score).toBe(75); // 3 transactions * 25
      expect(rapidRule?.message).toContain('3 recent transactions');
    });

    it('should ignore old transactions', async () => {
      mockContext.previousTransactions = [
        {
          id: 'txn-1',
          amount: 1000,
          currency: 'KES',
          status: 'COMPLETED',
          gateway: 'PAYSTACK',
          timestamp: new Date(Date.now() - 10 * 60 * 1000) // 10 minutes ago
        },
        {
          id: 'txn-2',
          amount: 2000,
          currency: 'KES',
          status: 'COMPLETED',
          gateway: 'PAYSTACK',
          timestamp: new Date(Date.now() - 20 * 60 * 1000) // 20 minutes ago
        }
      ];
      
      const report = await service.checkPayment(mockPaymentRequest, mockContext);
      const rapidRule = report.results.find(r => r.ruleName === 'RAPID_SUCCESSIVE_TRANSACTIONS');
      
      expect(rapidRule?.passed).toBe(true); // Both are outside 5-minute window
    });
  });

  describe('Rule: Unusual Time', () => {
    it('should pass for normal business hours', async () => {
      const normalHour = new Date();
      normalHour.setHours(14, 0, 0, 0); // 2 PM
      mockContext.timestamp = normalHour;
      
      const report = await service.checkPayment(mockPaymentRequest, mockContext);
      const timeRule = report.results.find(r => r.ruleName === 'UNUSUAL_TIME');
      
      expect(timeRule?.passed).toBe(true);
    });

    it('should fail for early morning transactions', async () => {
      const earlyMorning = new Date();
      earlyMorning.setHours(3, 0, 0, 0); // 3 AM
      mockContext.timestamp = earlyMorning;
      
      const report = await service.checkPayment(mockPaymentRequest, mockContext);
      const timeRule = report.results.find(r => r.ruleName === 'UNUSUAL_TIME');
      
      expect(timeRule?.passed).toBe(false);
      expect(timeRule?.score).toBe(30);
      expect(timeRule?.message).toContain('outside normal business hours');
    });

    it('should fail for late night transactions', async () => {
      const lateNight = new Date();
      lateNight.setHours(22, 0, 0, 0); // 10 PM
      mockContext.timestamp = lateNight;
      
      const report = await service.checkPayment(mockPaymentRequest, mockContext);
      const timeRule = report.results.find(r => r.ruleName === 'UNUSUAL_TIME');
      
      expect(timeRule?.passed).toBe(false);
    });

    it('should add weekend penalty', async () => {
      const weekend = new Date('2024-01-06T14:00:00Z'); // Saturday 2 PM
      mockContext.timestamp = weekend;
      
      const report = await service.checkPayment(mockPaymentRequest, mockContext);
      const timeRule = report.results.find(r => r.ruleName === 'UNUSUAL_TIME');
      
      expect(timeRule?.passed).toBe(false);
      expect(timeRule?.score).toBe(20);
      expect(timeRule?.message).toContain('weekend');
    });
  });

  describe('Rule: Email Domain Validation', () => {

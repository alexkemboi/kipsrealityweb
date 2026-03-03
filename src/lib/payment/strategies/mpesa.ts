import { IPaymentStrategy, PaymentRequest, PaymentResult, PaymentGateway } from "../types";
import { TransactionStatus } from "@prisma/client";

/**
 * M-Pesa Direct Integration (Daraja API) Strategy
 * This handles STK Push for direct M-Pesa payments without Paystack intermediary
 */
export class MpesaPaymentStrategy implements IPaymentStrategy {
    private consumerKey: string;
    private consumerSecret: string;
    private passkey: string;
    private shortcode: string;
    private environment: 'sandbox' | 'production';
    private baseUrl: string;

    constructor() {
        this.consumerKey = process.env.MPESA_CONSUMER_KEY || '';
        this.consumerSecret = process.env.MPESA_CONSUMER_SECRET || '';
        this.passkey = process.env.MPESA_PASSKEY || '';
        this.shortcode = process.env.MPESA_SHORTCODE || '';
        this.environment = (process.env.MPESA_ENV as 'sandbox' | 'production') || 'sandbox';
        
        this.baseUrl = this.environment === 'sandbox' 
            ? 'https://sandbox.safaricom.co.ke'
            : 'https://api.safaricom.co.ke';
        
        if (!this.consumerKey || !this.consumerSecret || !this.passkey || !this.shortcode) {
            console.warn('M-Pesa credentials not fully configured. MpesaPaymentStrategy will fail.');
        }
    }

    /**
     * Initialize M-Pesa STK Push payment
     */
    async initializePayment(req: PaymentRequest): Promise<PaymentResult> {
        try {
            // 1. Get access token
            const accessToken = await this.getAccessToken();
            
            // 2. Extract phone number from user (assuming it's in metadata)
            // For M-Pesa, we need the payer's phone number
            const phoneNumber = this.extractPhoneNumber(req);
            
            // 3. Generate timestamp in format YYYYMMDDHHMMSS
            const timestamp = this.generateTimestamp();
            
            // 4. Generate password (Base64 encoded)
            const password = this.generatePassword(timestamp);
            
            // 5. Prepare STK Push request
            const amountInCents = Math.round(req.amount * 100); // Convert to cents
            const transactionId = `RF${Date.now()}${Math.floor(Math.random() * 1000)}`;
            
            const stkPayload = {
                BusinessShortCode: this.shortcode,
                Password: password,
                Timestamp: timestamp,
                TransactionType: 'CustomerPayBillOnline',
                Amount: Math.floor(req.amount), // M-Pesa expects whole shillings
                PartyA: phoneNumber,
                PartyB: this.shortcode,
                PhoneNumber: phoneNumber,
                CallBackURL: `${process.env.NEXT_PUBLIC_APP_URL}/api/webhooks/mpesa/callback`,
                AccountReference: `INV-${req.invoiceId.substring(0, 8)}`,
                TransactionDesc: `Payment for invoice ${req.invoiceId}`,
            };

            // 6. Send STK Push request
            const response = await fetch(`${this.baseUrl}/mpesa/stkpush/v1/processrequest`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(stkPayload),
            });

            const data = await response.json();

            if (!response.ok || data.ResponseCode !== '0') {
                throw new Error(`M-Pesa STK Push failed: ${data.errorMessage || data.ResponseDescription || 'Unknown error'}`);
            }

            // 7. Return standardized result
            return {
                transactionId: transactionId,
                status: TransactionStatus.PENDING,
                gateway: PaymentGateway.MPESA_DIRECT,
                checkoutUrl: undefined, // No redirect - STK Push is sent to phone
                rawResponse: {
                    ...data,
                    mpesaCheckoutId: data.CheckoutRequestID,
                    customerMessage: data.CustomerMessage,
                },
            };

        } catch (error: unknown) {
            console.error('M-Pesa initialization error:', error);
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            throw new Error(`M-Pesa payment failed: ${errorMessage}`);
        }
    }

    /**
     * Verify M-Pesa transaction status
     */
    async verifyTransaction(reference: string): Promise<PaymentResult> {
        try {
            const accessToken = await this.getAccessToken();
            
            // In M-Pesa, we need to query using CheckoutRequestID
            // For now, we'll return a dummy implementation
            // Actual implementation would query transaction status
            
            return {
                transactionId: reference,
                status: TransactionStatus.PENDING,
                gateway: PaymentGateway.MPESA_DIRECT,
                rawResponse: { message: 'Verification not fully implemented' },
            };
        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            throw new Error(`M-Pesa verification failed: ${errorMessage}`);
        }
    }

    /**
     * Get OAuth access token from Daraja API
     */
    private async getAccessToken(): Promise<string> {
        const auth = Buffer.from(`${this.consumerKey}:${this.consumerSecret}`).toString('base64');
        
        const response = await fetch(`${this.baseUrl}/oauth/v1/generate?grant_type=client_credentials`, {
            method: 'GET',
            headers: {
                'Authorization': `Basic ${auth}`,
            },
        });

        const data = await response.json();
        
        if (!response.ok || data.error) {
            throw new Error(`M-Pesa authentication failed: ${data.errorMessage || 'Invalid credentials'}`);
        }

        return data.access_token;
    }

    /**
     * Extract phone number from payment request
     * Expected format: 2547XXXXXXXX (Kenyan format)
     */
    private extractPhoneNumber(req: PaymentRequest): string {
        // First check if phone is in metadata
        if (req.metadata?.phoneNumber) {
            return this.normalizePhoneNumber(req.metadata.phoneNumber);
        }
        
        // Check user's phone field
        if (req.user.phone) {
            return this.normalizePhoneNumber(req.user.phone);
        }
        
        throw new Error('Phone number is required for M-Pesa payments. Please provide a phone number in metadata.phoneNumber or user profile.');
    }

    /**
     * Normalize phone number to M-Pesa format (2547XXXXXXXX)
     */
    private normalizePhoneNumber(phone: string): string {
        // Remove any non-digit characters
        let cleaned = phone.replace(/\D/g, '');
        
        // If starts with 0, replace with 254
        if (cleaned.startsWith('0')) {
            cleaned = '254' + cleaned.substring(1);
        }
        
        // If starts with 7 and length is 9, add 254
        if (cleaned.startsWith('7') && cleaned.length === 9) {
            cleaned = '254' + cleaned;
        }
        
        // If starts with +254, remove the +
        if (cleaned.startsWith('+254')) {
            cleaned = cleaned.substring(1);
        }
        
        // Validate final format
        if (!cleaned.match(/^2547\d{8}$/)) {
            throw new Error(`Invalid phone number format. Expected Kenyan format (2547XXXXXXXX), got: ${cleaned}`);
        }
        
        return cleaned;
    }

    /**
     * Generate timestamp in format YYYYMMDDHHMMSS
     */
    private generateTimestamp(): string {
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        const seconds = String(now.getSeconds()).padStart(2, '0');
        
        return `${year}${month}${day}${hours}${minutes}${seconds}`;
    }

    /**
     * Generate password (Base64 encoded)
     * Format: BusinessShortCode + Passkey + Timestamp
     */
    private generatePassword(timestamp: string): string {
        const passwordString = `${this.shortcode}${this.passkey}${timestamp}`;
        return Buffer.from(passwordString).toString('base64');
    }
}
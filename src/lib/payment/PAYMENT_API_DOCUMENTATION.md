# Payment API Documentation

## Overview

RentFlow360's payment infrastructure supports multiple payment gateways with region-based routing. The system provides a unified interface for processing payments through Stripe (USA), Paystack (Kenya), and direct M-Pesa integration.

## Architecture

### Core Components

1. **Payment Factory** (`/src/lib/payment/payment-factory.ts`) - Gateway strategy selection
2. **Payment Strategies** (`/src/lib/payment/strategies/`) - Gateway-specific implementations
3. **Error Handler** (`/src/lib/payment/payment-error-handler.ts`) - Error classification and retry logic
4. **Fraud Detection** (`/src/lib/payment/fraud-detection-service.ts`) - Fraud prevention rules
5. **Encryption Utilities** (`/src/lib/payment/encryption-utils.ts`) - Non-PCI data encryption

### Flow Diagram

```
User Request → Payment Factory → Gateway Strategy → External Gateway → Webhook → DB Update → GL Posting
```

## API Endpoints

### 1. Initialize Payment

**Endpoint:** `POST /api/payments/initialize`

Initializes a payment transaction and returns gateway-specific payment initiation data.

**Request:**

```json
{
  "invoiceId": "string (required)"
}
```

**Response:**

```json
{
  "success": true,
  "transactionId": "gateway_transaction_id",
  "gateway": "STRIPE" | "PAYSTACK" | "MPESA_DIRECT",
  "redirectUrl": "optional_redirect_url",
  "rawResponse": {
    "mpesaCheckoutId": "for_mpesa",
    "customerMessage": "for_mpesa",
    "checkoutUrl": "for_paystack",
    "clientSecret": "for_stripe"
  }
}
```

**Error Responses:**

- `400` - Missing invoiceId
- `401` - Unauthorized
- `404` - Invoice not found
- `500` - Gateway error

### 2. Webhook Callbacks

#### Stripe Webhook

**Endpoint:** `POST /api/webhooks/stripe`

Handles Stripe payment events (payment_intent.succeeded, payment_intent.failed, etc.)

#### Paystack Webhook

**Endpoint:** `POST /api/webhooks/paystack`

Handles Paystack payment events (charge.success, transfer.success, etc.)

#### M-Pesa Webhook

**Endpoint:** `POST /api/webhooks/mpesa/callback`

Handles M-Pesa STK Push callbacks from Safaricom Daraja API

### 3. Payment Management

#### Get Payments

**Endpoint:** `GET /api/payments`

Returns list of payments for the current user's organization.

**Query Parameters:**

- `status` - Filter by payment status
- `gateway` - Filter by payment gateway
- `limit` - Pagination limit (default: 50)
- `offset` - Pagination offset (default: 0)

#### Get Payment by ID

**Endpoint:** `GET /api/payments/:id`

Returns detailed payment information.

#### Reverse Payment

**Endpoint:** `POST /api/payments/:id/reversal`

Reverses a payment and updates invoice status.

**Request:**

```json
{
  "reason": "string (optional)"
}
```

### 4. Invoice Payments

#### Create Payment for Invoice

**Endpoint:** `POST /api/invoices/:id/payments`

Creates a manual payment record for an invoice.

**Request:**

```json
{
  "amount": "number (required)",
  "method": "CASH" | "BANK_TRANSFER" | "MPESA" | "CREDIT_CARD",
  "reference": "string (optional)",
  "paidOn": "ISO date string (optional, defaults to now)"
}
```

#### Get Invoice Payments

**Endpoint:** `GET /api/invoices/:id/payments`

Returns all payments for a specific invoice.

### 5. Receipt Management

#### Generate Receipt

**Endpoint:** `POST /api/receipt/generate`

Generates a receipt for a payment.

**Request:**

```json
{
  "paymentId": "string (required)"
}
```

#### Get Receipt

**Endpoint:** `GET /api/receipt/:id`

Retrieves a receipt by ID or payment ID.

**Query Parameters:**

- `byPayment` - Set to `true` if ID is a payment ID

## Payment Flows

### Flow 1: Online Payment (Credit Card)

1. **Initiation:** User clicks "Pay Now" on invoice
2. **Strategy Selection:** Payment Factory selects Stripe (USA) or Paystack (Kenya)
3. **Gateway Call:** Initialize payment intent/transaction
4. **Frontend Handling:** Redirect to gateway or show payment form
5. **Webhook Processing:** Gateway calls webhook on success/failure
6. **Database Update:** Update payment status and invoice balance
7. **GL Posting:** Post transaction to General Ledger

### Flow 2: M-Pesa STK Push

1. **Initiation:** User selects M-Pesa payment
2. **STK Push:** System sends STK Push request to user's phone
3. **User Action:** User enters PIN on phone
4. **Callback:** Safaricom sends callback to `/api/webhooks/mpesa/callback`
5. **Validation:** Verify transaction with Safaricom API
6. **Completion:** Update payment status and notify user

### Flow 3: Manual Payment Entry

1. **Entry:** Property manager enters payment details
2. **Validation:** Check invoice balance and payment amount
3. **Creation:** Create payment record with status "SETTLED"
4. **GL Posting:** Automatically post to General Ledger
5. **Notification:** Send receipt to tenant

## Error Handling

### Error Types

| Error Type            | Retryable | User Message                               | Action                             |
| --------------------- | --------- | ------------------------------------------ | ---------------------------------- |
| NETWORK_ERROR         | Yes       | "Network error. Please try again."         | Retry with exponential backoff     |
| AUTHENTICATION_ERROR  | No        | "Authentication failed. Contact support."  | Alert admin, do not retry          |
| VALIDATION_ERROR      | No        | "Invalid payment details."                 | Show validation errors             |
| FRAUD_DETECTED        | No        | "Transaction flagged for review."          | Block transaction, alert security  |
| PAYMENT_GATEWAY_ERROR | Yes       | "Payment gateway error. Please try again." | Retry with backoff                 |
| INSUFFICIENT_FUNDS    | No        | "Insufficient funds."                      | Suggest alternative payment method |

### Retry Logic

- **Max Attempts:** 3 (configurable)
- **Base Delay:** 1000ms
- **Backoff Multiplier:** 2
- **Max Delay:** 10000ms

Retry logic is automatically applied to retryable errors via `PaymentErrorHandler.withRetry()`.

## Fraud Detection Rules

### Rule 1: Amount Threshold

- **Description:** Flag transactions above configured threshold
- **Threshold:** $10,000 (configurable)
- **Action:** Require manual review

### Rule 2: Velocity Check

- **Description:** Detect multiple rapid transactions from same user
- **Limit:** 5 transactions in 10 minutes
- **Action:** Temporarily block user, require verification

### Rule 3: Geographic Anomaly

- **Description:** Detect transactions from unusual locations
- **Check:** Compare IP location with user's usual locations
- **Action:** Require additional authentication

### Rule 4: Time-of-Day Anomaly

- **Description:** Detect transactions at unusual hours
- **Hours:** 2 AM - 5 AM local time
- **Action:** Flag for review, require verification

## Encryption

### Data Classification

| Data Type           | Encryption Required  | Storage          | Key                                |
| ------------------- | -------------------- | ---------------- | ---------------------------------- |
| Card Numbers (PCI)  | NEVER handled by app | External gateway | N/A                                |
| Bank Account Tokens | AES-256-GCM          | Database         | PAYMENT_ENCRYPTION_KEY             |
| Payment Metadata    | AES-256-GCM          | Database         | PAYMENT_ENCRYPTION_KEY_METADATA    |
| User Information    | AES-256-GCM          | Database         | PAYMENT_ENCRYPTION_KEY_USER_INFO   |
| Transaction Details | AES-256-GCM          | Database         | PAYMENT_ENCRYPTION_KEY_TRANSACTION |
| Webhook Payloads    | AES-256-GCM          | Database         | PAYMENT_ENCRYPTION_KEY_WEBHOOK     |

### Key Management

1. **Generation:** Use `openssl rand -base64 32`
2. **Rotation:** Use `rotateEncryptionKey()` function
3. **Storage:** Environment variables only
4. **Backup:** Secure key vault (AWS Secrets Manager, HashiCorp Vault)

## Testing

### Sandbox Credentials

#### Stripe

- **Public Key:** `pk_test_...`
- **Secret Key:** `sk_test_...`
- **Webhook Secret:** `whsec_...`

#### Paystack

- **Public Key:** `pk_test_...`
- **Secret Key:** `sk_test_...`
- **Test Phone:** `+254700000000`

#### M-Pesa Daraja

- **Consumer Key:** Sandbox credentials from Safaricom
- **Consumer Secret:** Sandbox credentials from Safaricom
- **Shortcode:** `174379` (sandbox)
- **Passkey:** Sandbox passkey from Safaricom

### Test Cards

#### Stripe Test Cards

- Success: `4242 4242 4242 4242`
- Decline: `4000 0000 0000 0002`
- Authentication Required: `4000 0025 0000 3155`

#### Paystack Test Cards

- Success: `5078 5078 5078 5078`
- Decline: Any card with CVC `081`

### Test Environment Setup

1. **Clone Repository:** `git clone https://github.com/your-org/rentflow360.git`
2. **Install Dependencies:** `npm install`
3. **Copy Environment:** `cp .env.example .env.test`
4. **Set Sandbox Keys:** Update `.env.test` with sandbox credentials
5. **Run Tests:** `npm test -- payment`

## Webhook Security

### Signature Verification

All webhooks must be verified using gateway-provided signatures:

```typescript
// Stripe
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const sig = req.headers["stripe-signature"];
const event = stripe.webhooks.constructEvent(payload, sig, secret);

// Paystack
const crypto = require("crypto");
const hash = crypto
  .createHmac("sha512", secret)
  .update(JSON.stringify(req.body))
  .digest("hex");
if (hash !== req.headers["x-paystack-signature"]) {
  throw new Error("Invalid signature");
}
```

### Idempotency

All webhook handlers are idempotent - processing the same event multiple times has the same effect as processing it once.

## Monitoring & Logging

### Key Metrics

- Payment success rate by gateway
- Average transaction time
- Fraud detection rate
- Webhook delivery success rate

### Logging Levels

- **INFO:** Payment initiated, completed
- **WARN:** Retry attempts, validation failures
- **ERROR:** Gateway errors, fraud detection
- **DEBUG:** Full request/response tracing (enable in dev only)

### Alerting

- Immediate alert for authentication errors
- Daily summary for fraud detection
- Weekly report for payment metrics

## Troubleshooting

### Common Issues

#### Issue 1: Webhook Not Received

**Solution:**

1. Check gateway webhook configuration
2. Verify endpoint is publicly accessible
3. Check firewall/security group rules
4. Test with ngrok in development

#### Issue 2: Payment Stuck in Pending

**Solution:**

1. Check webhook processing logs
2. Verify payment status in gateway dashboard
3. Check database connection
4. Verify GL posting service is running

#### Issue 3: Invalid Signature

**Solution:**

1. Verify webhook secret matches gateway configuration
2. Check timestamp freshness (replay attacks)
3. Verify payload hasn't been modified

#### Issue 4: Rate Limiting

**Solution:**

1. Implement request queuing
2. Add exponential backoff
3. Contact gateway support for limit increase

## Security Best Practices

1. **Never store PCI data** - Use tokenization via payment gateways
2. **Encrypt all sensitive data** - Use AES-256-GCM with unique keys per data type
3. **Validate webhook signatures** - Prevent replay attacks
4. **Implement rate limiting** - Prevent brute force attacks
5. **Regular security audits** - Quarterly penetration testing
6. **Key rotation** - Rotate encryption keys every 90 days
7. **Least privilege** - Minimal database permissions for payment service
8. **Audit logging** - Log all payment operations for compliance

## Compliance

### GDPR

- Encrypt all PII data
- Right to erasure implementation
- Data processing agreements with gateways

### PCI DSS

- Use PCI-compliant payment gateways
- Never handle card data directly
- Regular security assessments

### Local Regulations

- Kenya: Comply with Central Bank of Kenya regulations
- USA: Comply with state-by-state money transmitter laws
- EU: Comply with PSD2 and Strong Customer Authentication

## Support

For payment-related issues:

1. Check application logs at `/var/log/payment-service.log`
2. Review gateway dashboard for transaction status
3. Contact gateway support with transaction ID
4. Escalate to development team if issue persists

## Changelog

### v1.0.0 (Current)

- Initial payment infrastructure
- Multi-gateway support (Stripe, Paystack, M-Pesa)
- Error handling and retry logic
- Fraud detection service
- Encryption utilities
- Comprehensive test suite

### Planned Features

- Recurring payments/subscriptions
- Payment plans and installment support
- Advanced fraud detection (machine learning)
- Multi-currency support
- Payment reconciliation automation

# RentFlow360 API Documentation

**Version:** 6.0
**Date:** March 4, 2026
**Status:** Production Ready - Multi-Payment Gateway Integration Complete

---

## Table of Contents

1. [Overview](#1-overview)
2. [Technology Stack](#2-technology-stack)
3. [Authentication APIs](#3-authentication-apis)
4. [Payment APIs](#4-payment-apis)
5. [Stripe & Plaid Integration](#5-stripe--plaid-integration)
6. [Paystack & M-Pesa Integration](#6-paystack--m-pesa-integration)
7. [Invoice APIs](#7-invoice-apis)
8. [Financial APIs](#8-financial-apis)
9. [Property Management APIs](#9-property-management-apis)
10. [Lease Management APIs](#10-lease-management-apis)
11. [Tenant Application APIs](#11-tenant-application-apis)
12. [Utility Management APIs](#12-utility-management-apis)
13. [Maintenance APIs](#13-maintenance-apis)
14. [Document Signing APIs](#14-document-signing-apis)
15. [Listing Marketplace APIs](#15-listing-marketplace-apis)
16. [Dashboard Analytics APIs](#16-dashboard-analytics-apis)
17. [Webhooks](#17-webhooks)
18. [Security & Encryption](#18-security--encryption)
19. [Error Handling](#19-error-handling)

---

## 1. Overview

RentFlow360 is a comprehensive property rental management platform with multi-region payment processing capabilities. The system supports:

- **USA Market**: Stripe (card payments), Plaid (bank verification), ACH transfers
- **Africa Market**: Paystack (Nigeria, Ghana), M-Pesa (Kenya)
- **Security**: SSN encryption (AES-256-GCM), JWT authentication, role-based access

### API Statistics

- **Total API Endpoints**: 175
- **Database Models**: 79
- **Prisma Schema Lines**: 1,727

### Base URL

```
Production: https://api.rentflow360.com
Development: http://localhost:3000
```

### Authentication

All protected endpoints require JWT Bearer token authentication:

```
Authorization: Bearer <your_jwt_token>
```

---

## 2. Technology Stack

### Core Technologies

| Technology | Version | Purpose                         |
| ---------- | ------- | ------------------------------- |
| Next.js    | 16.1.6  | React framework with App Router |
| React      | 19.1.0  | UI library                      |
| TypeScript | 5.9.3   | Type safety                     |
| Prisma     | 6.19.2  | Database ORM                    |
| MySQL      | 8.0+    | Production database             |

### Payment Processing

| Service  | Version | Purpose                   |
| -------- | ------- | ------------------------- |
| Stripe   | 20.3.1  | Card & ACH payments (USA) |
| Plaid    | 41.1.0  | Bank verification (USA)   |
| Paystack | -       | Africa payments           |
| M-Pesa   | -       | Kenya mobile money        |

### Security

| Library      | Version | Purpose            |
| ------------ | ------- | ------------------ |
| bcryptjs     | 3.0.2   | Password hashing   |
| jsonwebtoken | 9.0.2   | JWT authentication |
| Zod          | 4.3.6   | Runtime validation |

---

## 3. Authentication APIs

### 3.1 Login

**POST** `/api/auth/login`

Authenticate user and receive JWT tokens.

**Request Body:**

```json
{
  "email": "user@example.com",
  "password": "securepassword123"
}
```

**Response (200):**

```json
{
  "success": true,
  "user": {
    "id": "user_123",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "role": "PROPERTY_MANAGER"
  },
  "accessToken": "eyJhbGciOiJIUzI1NiIs...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
}
```

### 3.2 Register

**POST** `/api/auth/register`

Create new user account.

**Request Body:**

```json
{
  "email": "newuser@example.com",
  "password": "securepassword123",
  "firstName": "Jane",
  "lastName": "Smith",
  "role": "TENANT",
  "phone": "+254712345678"
}
```

### 3.3 Refresh Token

**POST** `/api/auth/refresh`

Refresh expired access token.

**Request Body:**

```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
}
```

**Response (200):**

```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIs...",
  "expiresAt": 1735689600000
}
```

### 3.4 Get Current User

**GET** `/api/auth/me`

Get authenticated user profile.

**Headers:**

```
Authorization: Bearer <access_token>
```

**Response (200):**

```json
{
  "id": "user_123",
  "email": "user@example.com",
  "firstName": "John",
  "lastName": "Doe",
  "phone": "+254712345678",
  "role": "PROPERTY_MANAGER",
  "organizationId": "org_456"
}
```

### 3.5 Verify Email

**POST** `/api/auth/verify-email`

Verify user email address.

**Request Body:**

```json
{
  "token": "verification_token_here"
}
```

### 3.6 Forgot Password

**POST** `/api/auth/forgot-password`

Request password reset.

**Request Body:**

```json
{
  "email": "user@example.com"
}
```

### 3.7 Reset Password

**POST** `/api/auth/reset-password`

Reset password using token.

**Request Body:**

```json
{
  "token": "reset_token_here",
  "newPassword": "newsecurepassword123"
}
```

### 3.8 Two-Factor Authentication

**POST** `/api/auth/2fa/toggle`

Enable or disable 2FA.

**Request Body:**

```json
{
  "enabled": true
}
```

**POST** `/api/auth/2fa/send`

Send 2FA code to user.

**Request Body:**

```json
{
  "userId": "user_123"
}
```

**POST** `/api/auth/2fa/verify`

Verify 2FA code.

**Request Body:**

```json
{
  "userId": "user_123",
  "code": "123456"
}
```

---

## 4. Payment APIs

### 4.1 Initialize Payment

**POST** `/api/payments/initialize`

Initialize payment with automatic gateway selection based on region.

**Request Body:**

```json
{
  "invoiceId": "inv_123",
  "amount": 50000,
  "currency": "USD",
  "region": "USA"
}
```

**Response (200):**

```json
{
  "success": true,
  "payment": {
    "id": "pay_789",
    "invoiceId": "inv_123",
    "amount": 50000,
    "currency": "USD",
    "status": "PENDING",
    "gateway": "STRIPE",
    "gatewayReference": "pi_xxx"
  },
  "clientSecret": "pi_xxx_secret_xxx",
  "checkoutUrl": null
}
```

**For Kenya (M-Pesa):**

```json
{
  "region": "KEN",
  "invoiceId": "inv_123",
  "amount": 5000,
  "currency": "KES"
}
```

**Response:**

```json
{
  "success": true,
  "payment": {
    "id": "pay_789",
    "gateway": "MPESA_DIRECT"
  },
  "checkoutUrl": null,
  "message": "STK push sent to your phone"
}
```

### 4.2 List Payments

**GET** `/api/payments`

List all payments with filtering.

**Query Parameters:**

| Parameter | Type   | Description                  |
| --------- | ------ | ---------------------------- |
| page      | number | Page number (default: 1)     |
| limit     | number | Items per page (default: 20) |
| status    | string | Filter by status             |
| gateway   | string | Filter by gateway            |

**Response (200):**

```json
{
  "payments": [
    {
      "id": "pay_123",
      "invoiceId": "inv_456",
      "amount": 50000,
      "currency": "USD",
      "status": "SETTLED",
      "gateway": "STRIPE",
      "method": "CREDIT_CARD",
      "createdAt": "2026-03-04T10:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 150
  }
}
```

### 4.3 Get Payment

**GET** `/api/payments/[id]`

Get payment details by ID.

**Response (200):**

```json
{
  "id": "pay_123",
  "invoiceId": "inv_456",
  "amount": 50000,
  "currency": "USD",
  "status": "SETTLED",
  "gateway": "STRIPE",
  "method": "CREDIT_CARD",
  "gatewayReference": "pi_xxx",
  "createdAt": "2026-03-04T10:00:00Z",
  "settledAt": "2026-03-04T10:01:00Z"
}
```

### 4.4 Reverse Payment

**POST** `/api/payments/[id]/reversal`

Reverse a payment with automatic GL adjustment.

**Request Body:**

```json
{
  "reason": "Customer request"
}
```

**Response (200):**

```json
{
  "success": true,
  "reversedPayment": {
    "id": "pay_123",
    "status": "REVERSED",
    "isReversed": true
  },
  "invoice": {
    "id": "inv_456",
    "status": "PARTIAL",
    "balanceDue": 50000
  }
}
```

### 4.5 Get Receipt

**GET** `/api/payment/[id]/receipt`

Get payment receipt.

**Response (200):**

```json
{
  "receiptNo": "RCP-2026-0001",
  "paymentId": "pay_123",
  "invoiceId": "inv_456",
  "amount": 50000,
  "currency": "USD",
  "method": "CREDIT_CARD",
  "issuedOn": "2026-03-04T10:00:00Z",
  "propertyName": "Sunset Apartments",
  "tenantName": "John Doe"
}
```

---

## 5. Stripe & Plaid Integration

### 5.1 Create Plaid Link Token

**POST** `/api/plaid/create-link-token`

Create a Plaid Link token for bank account connection.

**Request Body:**

```json
{}
```

**Response (200):**

```json
{
  "linkToken": "link-sandbox-xxx",
  "expiration": "2026-03-04T12:00:00Z"
}
```

### 5.2 Exchange Plaid Token

**POST** `/api/plaid/exchange-token`

Exchange Plaid public token for access token and create Stripe bank account.

**Request Body:**

```json
{
  "publicToken": "public-sandbox-xxx",
  "accountId": "account_xxx"
}
```

**Response (200):**

```json
{
  "success": true,
  "paymentMethod": {
    "id": "pm_123",
    "type": "ACH",
    "plaidAccessToken": "access-xxx",
    "stripePaymentMethodId": "pm_stripe_xxx",
    "isDefault": true
  }
}
```

### 5.3 Stripe Webhook

**POST** `/api/webhooks/stripe`

Handle Stripe payment events.

**Headers:**

```
stripe-signature: <signature>
```

**Event Types:**

- `payment_intent.succeeded`
- `payment_intent.payment_failed`
- `charge.refunded`

---

## 6. Paystack & M-Pesa Integration

### 6.1 Paystack Webhook

**POST** `/api/webhooks/paystack`

Handle Paystack payment events.

**Event Types:**

- `charge.success`
- `transfer.failed`
- `bulk_transfer.failed`

### 6.2 M-Pesa Callback

**POST** `/api/webhooks/mpesa/callback`

Handle M-Pesa STK Push callback.

**Request Body:**

```json
{
  "Body": {
    "stkCallback": {
      "MerchantRequestID": "xxx",
      "CheckoutRequestID": "yyy",
      "ResultCode": 0,
      "ResultDesc": "Success",
      "CallbackMetadata": {
        "Item": [
          { "Name": "Amount", "Value": 5000 },
          { "Name": "MpesaReceiptNumber", "Value": "xxx" },
          { "Name": "PhoneNumber", "Value": "254712345678" }
        ]
      }
    }
  }
}
```

**Response (200):**

```json
{
  "ResultCode": 0,
  "ResultDesc": "Success"
}
```

---

## 7. Invoice APIs

### 7.1 List Invoices

**GET** `/api/invoices`

List invoices with filtering.

**Query Parameters:**

| Parameter | Type   | Description                               |
| --------- | ------ | ----------------------------------------- |
| status    | string | Filter by status (PENDING, PAID, OVERDUE) |
| leaseId   | string | Filter by lease                           |
| page      | number | Page number                               |

**Response (200):**

```json
{
  "invoices": [
    {
      "id": "inv_123",
      "leaseId": "lease_456",
      "amount": 50000,
      "status": "PENDING",
      "dueDate": "2026-04-01T00:00:00Z",
      "totalAmount": 50000,
      "balanceDue": 50000
    }
  ]
}
```

### 7.2 Create Invoice

**POST** `/api/invoices`

Create manual invoice.

**Request Body:**

```json
{
  "leaseId": "lease_456",
  "amount": 50000,
  "dueDate": "2026-04-01",
  "type": "RENT",
  "description": "April 2026 Rent"
}
```

### 7.3 Generate Full Rent Invoices

**POST** `/api/invoices/full`

Generate invoices for all active leases.

**Request Body:**

```json
{
  "dueDate": "2026-04-01",
  "generateFor": "ACTIVE_LEASES"
}
```

### 7.4 Auto-Generate Invoices

**POST** `/api/invoices/auto`

Automatically generate invoices based on lease schedules.

### 7.5 Add Payment to Invoice

**POST** `/api/invoices/[id]/payments`

Add payment to invoice.

**Request Body:**

```json
{
  "amount": 50000,
  "paymentDate": "2026-03-04",
  "method": "CREDIT_CARD",
  "reference": "PAY-123"
}
```

### 7.6 Download Invoice PDF

**GET** `/api/invoices/[id]/download`

Download invoice as PDF.

---

## 8. Financial APIs

### 8.1 Financial Summary

**GET** `/api/finance/summary`

Get real-time financial dashboard data.

**Query Parameters:**

| Parameter      | Type   | Description            |
| -------------- | ------ | ---------------------- |
| organizationId | string | Filter by organization |

**Response (200):**

```json
{
  "cashInBank": 1500000,
  "outstandingArrears": 125000,
  "totalRevenue": 2500000,
  "totalExpenses": 800000,
  "currency": "USD"
}
```

### 8.2 General Ledger

**GET** `/api/finance/ledger`

Get general ledger entries.

**Query Parameters:**

| Parameter   | Type   | Description       |
| ----------- | ------ | ----------------- |
| accountCode | string | Filter by account |
| page        | number | Page number       |
| limit       | number | Items per page    |
| startDate   | date   | Start date filter |
| endDate     | date   | End date filter   |

**Response (200):**

```json
{
  "entries": [
    {
      "id": "je_123",
      "date": "2026-03-04",
      "description": "Rent Payment - Unit 101",
      "debit": 50000,
      "credit": 0,
      "accountCode": "1000",
      "accountName": "Cash"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 50,
    "total": 1000
  }
}
```

### 8.3 Create Journal Entry

**POST** `/api/finance/journal`

Create manual journal entry.

**Request Body:**

```json
{
  "description": "Rent Payment - Unit 101",
  "date": "2026-03-04",
  "entries": [
    { "accountCode": "1000", "debit": 50000, "credit": 0 },
    { "accountCode": "4000", "debit": 0, "credit": 50000 }
  ]
}
```

---

## 9. Property Management APIs

### 9.1 List Properties

**GET** `/api/properties`

List all properties.

**Query Parameters:**

| Parameter | Type   | Description       |
| --------- | ------ | ----------------- |
| managerId | string | Filter by manager |
| status    | string | Filter by status  |

**Response (200):**

```json
{
  "properties": [
    {
      "id": "prop_123",
      "name": "Sunset Apartments",
      "type": "APARTMENT",
      "address": "123 Main St",
      "units": 12,
      "occupiedUnits": 10
    }
  ]
}
```

### 9.2 Create Property

**POST** `/api/properties`

Create new property.

**Request Body:**

```json
{
  "name": "Sunset Apartments",
  "type": "APARTMENT",
  "address": "123 Main St",
  "city": "Nairobi",
  "country": "KEN",
  "units": [
    { "unitNumber": "101", "bedrooms": 1, "bathrooms": 1, "rentAmount": 50000 }
  ]
}
```

### 9.3 Property Statistics

**GET** `/api/properties/stats`

Get property performance statistics.

**Response (200):**

```json
{
  "totalProperties": 15,
  "totalUnits": 180,
  "occupiedUnits": 165,
  "vacancyRate": 0.083,
  "totalRentCollected": 8250000,
  "totalOutstanding": 450000
}
```

---

## 10. Lease Management APIs

### 10.1 List Leases

**GET** `/api/lease`

List all leases.

**Response (200):**

```json
{
  "leases": [
    {
      "id": "lease_123",
      "unitId": "unit_456",
      "tenantId": "user_789",
      "startDate": "2026-01-01",
      "endDate": "2027-01-01",
      "rentAmount": 50000,
      "status": "ACTIVE"
    }
  ]
}
```

### 10.2 Create Lease

**POST** `/api/lease`

Create new lease.

**Request Body:**

```json
{
  "unitId": "unit_456",
  "tenantId": "user_789",
  "startDate": "2026-01-01",
  "endDate": "2027-01-01",
  "rentAmount": 50000,
  "paymentDueDay": 1,
  "paymentFrequency": "MONTHLY"
}
```

### 10.3 Get Lease

**GET** `/api/lease/[id]`

Get lease details.

**Response (200):**

```json
{
  "id": "lease_123",
  "unit": {
    "unitNumber": "101",
    "property": { "name": "Sunset Apartments" }
  },
  "tenant": {
    "firstName": "John",
    "lastName": "Doe"
  },
  "rentAmount": 50000,
  "status": "ACTIVE",
  "invoices": [...],
  "payments": [...]
}
```

### 10.4 Update Lease Status

**PATCH** `/api/lease/[id]/status`

Update lease status.

**Request Body:**

```json
{
  "status": "ACTIVE",
  "reason": "Tenant moved in"
}
```

### 10.5 Lease Renewal

**POST** `/api/lease/[id]/renew`

Renew lease.

**Request Body:**

```json
{
  "newStartDate": "2027-01-01",
  "newEndDate": "2028-01-01",
  "newRentAmount": 55000
}
```

### 10.6 Lease Amendment

**POST** `/api/lease/[id]/ammendment`

Amend lease terms.

**Request Body:**

```json
{
  "field": "rentAmount",
  "oldValue": 50000,
  "newValue": 55000,
  "reason": "Annual rent review"
}
```

---

## 11. Tenant Application APIs

### 11.1 Create Tenant Application

**POST** `/api/tenant-application`

Create new tenant application with SSN encryption.

**Request Body:**

```json
{
  "fullName": "John Doe",
  "email": "john.doe@example.com",
  "phone": "+254712345678",
  "dob": "1990-05-15",
  "ssn": "123-45-6789",
  "address": "123 Main St, Nairobi",
  "employerName": "Tech Corp",
  "jobTitle": "Software Engineer",
  "monthlyIncome": "500000",
  "leaseType": "FIXED_TERM",
  "occupancyType": "RESIDENTIAL",
  "moveInDate": "2026-04-01",
  "leaseDuration": "12 months",
  "occupants": 2,
  "consent": true,
  "unitId": "unit_abc123"
}
```

**Note:** The SSN field is automatically encrypted using AES-256-GCM before storing in the database.

**Response (201):**

```json
{
  "success": true,
  "application": {
    "id": "app_123456",
    "fullName": "John Doe",
    "email": "john.doe@example.com",
    "phone": "+254712345678",
    "status": "PENDING",
    "ssnEncrypted": "a1b2c3d4e5f6:encrypted:data",
    "ssn": null,
    "property": {
      "id": "prop_abc",
      "name": "Sunset Apartments"
    },
    "unit": {
      "id": "unit_abc123",
      "unitNumber": "101"
    },
    "createdAt": "2026-03-04T10:30:00Z"
  }
}
```

### 11.2 List Tenant Applications

**GET** `/api/tenant-application`

List all tenant applications.

**Query Parameters:**

| Parameter  | Type   | Description        |
| ---------- | ------ | ------------------ |
| propertyId | string | Filter by property |
| status     | string | Filter by status   |

**Response (200):**

```json
{
  "applications": [
    {
      "id": "app_123456",
      "fullName": "John Doe",
      "email": "john.doe@example.com",
      "status": "PENDING",
      "property": {
        "name": "Sunset Apartments"
      },
      "unit": {
        "unitNumber": "101"
      },
      "createdAt": "2026-03-04T10:30:00Z"
    }
  ]
}
```

### 11.3 Get Single Application

**GET** `/api/tenant-application/[id]`

Get application details.

**Response (200):**

```json
{
  "id": "app_123456",
  "fullName": "John Doe",
  "email": "john.doe@example.com",
  "phone": "+254712345678",
  "status": "PENDING",
  "ssnEncrypted": "a1b2c3d4e5f6:encrypted:data",
  "property": {...},
  "unit": {...},
  "dob": "1990-05-15",
  "employerName": "Tech Corp",
  "monthlyIncome": "500000",
  "createdAt": "2026-03-04T10:30:00Z"
}
```

### 11.4 Update Application Status

**PATCH** `/api/tenant-application/[id]`

Update application status.

**Request Body:**

```json
{
  "status": "APPROVED"
}
```

**Valid statuses:** PENDING, APPROVED, REJECTED, UNDER_REVIEW

---

## 12. Utility Management APIs

### 12.1 Create Utility Bill

**POST** `/api/utilities/bills`

Create utility bill.

**Request Body:**

```json
{
  "propertyId": "prop_123",
  "type": "WATER",
  "billingPeriod": "2026-02",
  "totalAmount": 50000,
  "dueDate": "2026-03-15"
}
```

### 12.2 Post Utility Bill

**POST** `/api/utilities/bills/[id]/post`

Post utility bill to tenant invoices.

**Request Body:**

```json
{
  "allocationMethod": "OCCUPANCY_BASED"
}
```

### 12.3 Add Meter Reading

**POST** `/api/utilities/readings`

Add meter reading.

**Request Body:**

```json
{
  "utilityId": "util_123",
  "unitId": "unit_456",
  "reading": 150,
  "readingDate": "2026-03-01",
  "readBy": "admin"
}
```

### 12.4 List Utility Allocations

**GET** `/api/utilities/allocations`

List utility allocations.

---

## 13. Maintenance APIs

### 13.1 List Maintenance Requests

**GET** `/api/maintenance`

List maintenance requests.

**Query Parameters:**

| Parameter  | Type   | Description        |
| ---------- | ------ | ------------------ |
| status     | string | Filter by status   |
| priority   | string | Filter by priority |
| propertyId | string | Filter by property |

**Response (200):**

```json
{
  "requests": [
    {
      "id": "maint_123",
      "title": "Leaking faucet",
      "description": "Kitchen faucet is leaking",
      "status": "PENDING",
      "priority": "MEDIUM",
      "property": { "name": "Sunset Apartments" },
      "unit": { "unitNumber": "101" },
      "createdAt": "2026-03-04T10:00:00Z"
    }
  ]
}
```

### 13.2 Create Maintenance Request

**POST** `/api/maintenance`

Create maintenance request.

**Request Body:**

```json
{
  "title": "Leaking faucet",
  "description": "Kitchen faucet is leaking",
  "priority": "MEDIUM",
  "unitId": "unit_456",
  "category": "PLUMBING"
}
```

### 13.3 Assign Vendor

**POST** `/api/maintenance/[id]/assign`

Assign vendor to maintenance request.

**Request Body:**

```json
{
  "vendorId": "vendor_123",
  "estimatedCost": 5000,
  "scheduledDate": "2026-03-10"
}
```

---

## 14. Document Signing APIs

### 14.1 Upload Document

**POST** `/api/dss/documents`

Upload document for signing.

**Request Body:**

```json
{
  "name": "Lease Agreement",
  "type": "LEASE",
  "fileUrl": "https://cloudinary.com/..."
}
```

### 14.2 Get Document

**GET** `/api/dss/documents/[id]`

Get document details.

### 14.3 Sign Document

**POST** `/api/dss/sign`

Sign document.

**Request Body:**

```json
{
  "documentId": "doc_123",
  "signature": "data:image/png;base64,...",
  "signerId": "user_456"
}
```

### 14.4 Notarize Document

**POST** `/api/dss/notarize`

Notarize document on blockchain.

**Request Body:**

```json
{
  "documentId": "doc_123"
}
```

**Response (200):**

```json
{
  "success": true,
  "transactionHash": "0xabc123...",
  "blockchainRecord": {
    "documentHash": "sha256:...",
    "timestamp": "2026-03-04T10:00:00Z",
    "notaryAddress": "0x..."
  }
}
```

---

## 15. Listing Marketplace APIs

### 15.1 List Listings

**GET** `/api/listings`

List marketplace listings.

**Query Parameters:**

| Parameter    | Type   | Description             |
| ------------ | ------ | ----------------------- |
| status       | string | Filter by status        |
| propertyType | string | Filter by property type |
| minPrice     | number | Minimum price           |
| maxPrice     | number | Maximum price           |

### 15.2 Create Listing

**POST** `/api/listings`

Create marketplace listing.

**Request Body:**

```json
{
  "propertyId": "prop_123",
  "title": "Beautiful 2BR Apartment",
  "description": "Modern apartment with great views",
  "price": 50000,
  "status": "ACTIVE"
}
```

### 15.3 Update Listing Status

**PATCH** `/api/listings/[id]/status`

Update listing status.

**Request Body:**

```json
{
  "status": "ACTIVE"
}
```

### 15.4 Bulk Operations

**POST** `/api/listings/bulk`

Perform bulk listing operations.

**Request Body:**

```json
{
  "listingIds": ["list_1", "list_2"],
  "action": "ACTIVATE"
}
```

---

## 16. Dashboard Analytics APIs

### 16.1 Analytics

**GET** `/api/dashboard/analytics`

Get comprehensive dashboard analytics.

**Response (200):**

```json
{
  "totalProperties": 15,
  "totalUnits": 180,
  "occupiedUnits": 165,
  "vacancyRate": 0.083,
  "totalTenants": 165,
  "totalRevenue": {
    "mtd": 8250000,
    "ytd": 24750000
  },
  "outstandingArrears": 450000,
  "pendingMaintenance": 12,
  "revenueChart": [...],
  "occupancyChart": [...]
}
```

---

## 17. Webhooks

### 17.1 Stripe Webhook

**Endpoint:** `/api/webhooks/stripe`

**Events:**

```json
{
  "type": "payment_intent.succeeded",
  "data": {
    "object": {
      "id": "pi_xxx",
      "amount": 50000,
      "currency": "usd"
    }
  }
}
```

### 17.2 Paystack Webhook

**Endpoint:** `/api/webhooks/paystack`

**Events:**

```json
{
  "event": "charge.success",
  "data": {
    "reference": "PSK_xxx",
    "amount": 50000,
    "status": "success"
  }
}
```

### 17.3 M-Pesa Webhook

**Endpoint:** `/api/webhooks/mpesa/callback`

**Events:** STK Push callbacks with transaction details

---

## 18. Security & Encryption

### 18.1 SSN Encryption

RentFlow360 uses AES-256-GCM encryption for SSN data.

**Encryption Flow:**

1. User submits tenant application with SSN
2. Server validates SSN format
3. SSN is encrypted using AES-256-GCM
4. Encrypted value stored in `ssnEncrypted` field
5. Original `ssn` field is set to null
6. Only authorized personnel can decrypt

**Environment Variables:**

```
SSN_ENCRYPTION_KEY=your_32_byte_base64_encoded_key
```

### 18.2 Payment Data Encryption

Non-PCI payment metadata is encrypted using AES-256-GCM.

**Encrypted Fields:**

- Payment metadata
- Bank account details (via Plaid)
- Transaction details

### 18.3 Authentication Security

- JWT tokens with RS256 signing
- Access tokens: 15 minute expiry
- Refresh tokens: 7 day expiry
- Secure HTTP-only cookies

---

## 19. Error Handling

### Error Response Format

```json
{
  "error": "Error message",
  "code": "ERROR_CODE",
  "details": {}
}
```

### Common Error Codes

| Code             | HTTP Status | Description               |
| ---------------- | ----------- | ------------------------- |
| UNAUTHORIZED     | 401         | Authentication required   |
| FORBIDDEN        | 403         | Insufficient permissions  |
| NOT_FOUND        | 404         | Resource not found        |
| VALIDATION_ERROR | 400         | Invalid input data        |
| PAYMENT_FAILED   | 402         | Payment processing failed |
| INTERNAL_ERROR   | 500         | Server error              |

### Example Errors

**400 Bad Request:**

```json
{
  "error": "Missing required fields: email, password",
  "code": "VALIDATION_ERROR"
}
```

**401 Unauthorized:**

```json
{
  "error": "Invalid or expired token",
  "code": "UNAUTHORIZED"
}
```

**404 Not Found:**

```json
{
  "error": "Payment not found",
  "code": "NOT_FOUND"
}
```

**500 Internal Server Error:**

```json
{
  "error": "Internal server error",
  "code": "INTERNAL_ERROR",
  "details": "Database connection failed"
}
```

---

## Appendix: Environment Variables

```env
# Database
DATABASE_URL=mysql://user:password@host:port/database

# Authentication
NEXTAUTH_SECRET=your_secret_key
JWT_SECRET=your_jwt_secret

# Email
RESEND_API_KEY=your_resend_key

# Stripe (USA)
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Plaid (USA)
PLAID_CLIENT_ID=...
PLAID_SECRET=...
PLAID_ENV=sandbox

# Paystack (Africa)
PAYSTACK_SECRET_KEY=sk_...

# M-Pesa (Kenya)
MPESA_CONSUMER_KEY=...
MPESA_CONSUMER_SECRET=...
MPESA_SHORT_CODE=...
MPESA_PASSKEY=...

# Encryption
SSN_ENCRYPTION_KEY=your_32_byte_base64_key

# Admin
ADMIN_EMAIL=admin@rentflow360.com
```

---

_Document updated on March 4, 2026_

import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { financeActions } from "@/lib/finance/actions";
import { TransactionStatus, Payment, Prisma } from "@prisma/client";

/**
 * M-Pesa Daraja API STK Push Callback Handler
 * This endpoint receives payment confirmation from Safaricom M-Pesa API
 * 
 * Expected callback structure (from M-Pesa):
 * {
 *   "Body": {
 *     "stkCallback": {
 *       "MerchantRequestID": "29115-34620561-1",
 *       "CheckoutRequestID": "ws_CO_191220191020363925",
 *       "ResultCode": 0,
 *       "ResultDesc": "The service request is processed successfully.",
 *       "CallbackMetadata": {
 *         "Item": [
 *           { "Name": "Amount", "Value": 1 },
 *           { "Name": "MpesaReceiptNumber", "Value": "NLJ7RT61SV" },
 *           { "Name": "TransactionDate", "Value": 20191219102115 },
 *           { "Name": "PhoneNumber", "Value": 254708374149 }
 *         ]
 *       }
 *     }
 *   }
 * }
 */
export async function POST(req: Request) {
    try {
        const body = await req.json();

        // Log the incoming webhook for debugging
        console.log("M-Pesa Webhook Received:", JSON.stringify(body, null, 2));

        // Extract STK callback data
        const stkCallback = body?.Body?.stkCallback;
        if (!stkCallback) {
            console.error("Invalid M-Pesa webhook format:", body);
            return NextResponse.json(
                { error: "Invalid webhook format" },
                { status: 400 }
            );
        }

        const {
            MerchantRequestID,
            CheckoutRequestID,
            ResultCode,
            ResultDesc,
            CallbackMetadata
        } = stkCallback;

        if (typeof CheckoutRequestID !== "string" || CheckoutRequestID.length === 0) {
            return NextResponse.json(
                { error: "Missing CheckoutRequestID" },
                { status: 400 }
            );
        }

        if (typeof MerchantRequestID !== "string" || MerchantRequestID.length === 0) {
            return NextResponse.json(
                { error: "Missing MerchantRequestID" },
                { status: 400 }
            );
        }

        // Check if payment was successful
        if (ResultCode !== 0) {
            console.warn(`M-Pesa payment failed: ${ResultDesc} (Code: ${ResultCode})`);

            // Update payment status to FAILED if we can find it
            await updatePaymentStatus(CheckoutRequestID, TransactionStatus.FAILED, {
                errorCode: ResultCode,
                errorDescription: ResultDesc
            });

            return NextResponse.json({
                received: true,
                message: "Payment failed - logged"
            });
        }

        // Extract payment details from callback metadata
        const metadata = extractCallbackMetadata(CallbackMetadata);
        if (!metadata) {
            console.error("Failed to extract callback metadata:", CallbackMetadata);
            return NextResponse.json(
                { error: "Missing payment metadata" },
                { status: 400 }
            );
        }

        // Find payment by CheckoutRequestID
        const payment = await findPaymentByCheckoutId(CheckoutRequestID);
        if (!payment) {
            console.error(`Payment not found for CheckoutRequestID: ${CheckoutRequestID}`);
            return NextResponse.json({ error: "Payment not found" }, { status: 404 });
        }

        // Idempotency: if already settled with same receipt, acknowledge and exit
        const existingMeta = parseMetadataObject((payment as Payment & { metadata?: unknown }).metadata);
        if (
            payment.transactionStatus === TransactionStatus.SETTLED &&
            payment.gatewayReference === metadata.mpesaReceiptNumber &&
            existingMeta?.checkoutRequestId === CheckoutRequestID
        ) {
            return NextResponse.json({
                ResultCode: 0,
                ResultDesc: "Success"
            });
        }

        const updateData: Prisma.PaymentUpdateInput = {
            transactionStatus: TransactionStatus.SETTLED,
            gatewayReference: metadata.mpesaReceiptNumber
        };

        const existingMetadata = toInputJsonObject(
            parseMetadataObject((payment as Payment & { metadata?: unknown }).metadata)
        );

        const mpesaMetadata: Record<string, Prisma.InputJsonValue> = {
            ...existingMetadata,
            checkoutRequestId: CheckoutRequestID,
            merchantRequestId: MerchantRequestID,
            processedAt: new Date().toISOString()
        };

        if (metadata.transactionDate !== undefined) {
            mpesaMetadata.mpesaTransactionDate = metadata.transactionDate;
        }
        if (metadata.phoneNumber !== undefined) {
            mpesaMetadata.mpesaPhoneNumber = metadata.phoneNumber;
        }
        if (metadata.amount !== undefined) {
            mpesaMetadata.mpesaAmount = metadata.amount;
        }

        updateData.metadata = mpesaMetadata;

        const updatedPayment = await prisma.payment.update({
            where: { id: payment.id },
            data: updateData
        });

        // POST TO GENERAL LEDGER (The Financial Core)
        try {
            await financeActions.postPaymentToGL(updatedPayment.id);
            console.log(`✅ M-Pesa Payment ${metadata.mpesaReceiptNumber} Settled & Posted to GL.`);
        } catch (glError) {
            console.error("Failed to post payment to GL:", glError);
            // Don't fail the webhook - log and continue
        }

        // Send success response to M-Pesa
        return NextResponse.json({
            ResultCode: 0,
            ResultDesc: "Success"
        });
    } catch (error) {
        console.error("M-Pesa Webhook Error:", error);
        return NextResponse.json(
            { error: "Webhook processing failed" },
            { status: 500 }
        );
    }
}

/**
 * Extract metadata from M-Pesa callback
 */
function extractCallbackMetadata(callbackMetadata: unknown) {
    if (!callbackMetadata || typeof callbackMetadata !== "object") {
        return null;
    }

    const callback = callbackMetadata as Record<string, unknown>;
    if (!callback?.Item || !Array.isArray(callback.Item)) {
        return null;
    }

    const items = callback.Item;
    const metadata: {
        amount?: number;
        mpesaReceiptNumber?: string;
        transactionDate?: number;
        phoneNumber?: number;
    } = {};

    items.forEach((item: unknown) => {
        if (!item || typeof item !== "object") return;
        const itemObj = item as Record<string, unknown>;
        const name = itemObj.Name;
        const value = itemObj.Value;

        switch (name) {
            case "Amount":
                if (typeof value === "number") metadata.amount = value;
                break;
            case "MpesaReceiptNumber":
                if (typeof value === "string") metadata.mpesaReceiptNumber = value;
                break;
            case "TransactionDate":
                if (typeof value === "number") metadata.transactionDate = value;
                break;
            case "PhoneNumber":
                if (typeof value === "number") metadata.phoneNumber = value;
                break;
        }
    });

    return metadata.amount !== undefined && metadata.mpesaReceiptNumber
        ? metadata
        : null;
}

/**
 * Find payment by M-Pesa CheckoutRequestID
 * This could be stored in metadata or we need to search differently
 */
async function findPaymentByCheckoutId(checkoutRequestId: string) {
    try {
        const paymentByRef = await prisma.payment.findFirst({
            where: {
                gatewayReference: checkoutRequestId
            }
        });

        if (paymentByRef) {
            return paymentByRef;
        }

        const allPayments = await prisma.payment.findMany({
            where: {
                gateway: "MPESA_DIRECT"
            }
        });

        return allPayments.find((p) => {
            const meta = parseMetadataObject((p as Payment & { metadata?: unknown }).metadata);
            if (!meta) return false;

            const checkoutA = typeof meta.checkoutRequestId === "string" ? meta.checkoutRequestId : null;
            const checkoutB = typeof meta.CheckoutRequestID === "string" ? meta.CheckoutRequestID : null;

            return checkoutA === checkoutRequestId || checkoutB === checkoutRequestId;
        });
    } catch (error) {
        console.error("Error finding payment by checkout ID:", error);
        return null;
    }
}

/**
 * Update payment status for failed payments
 */
async function updatePaymentStatus(checkoutRequestId: string, status: TransactionStatus, errorDetails?: unknown) {
    try {
        const payment = await findPaymentByCheckoutId(checkoutRequestId);
        if (payment) {
            const currentMeta = toInputJsonObject(
                parseMetadataObject((payment as Payment & { metadata?: unknown }).metadata)
            );

            const updateData: Prisma.PaymentUpdateInput = {
                transactionStatus: status
            };

            const metadataUpdate: Record<string, Prisma.InputJsonValue> = {
                ...currentMeta,
                failedAt: new Date().toISOString()
            };

            if (errorDetails !== undefined && isInputJsonValue(errorDetails)) {
                metadataUpdate.errorDetails = errorDetails;
            }

            updateData.metadata = metadataUpdate;

            await prisma.payment.update({
                where: { id: payment.id },
                data: updateData
            });

            console.log(`Updated payment ${payment.id} to status: ${status}`);
        }
    } catch (error) {
        console.error("Failed to update payment status:", error);
    }
}

/**
 * Parse metadata object
 */
function parseMetadataObject(value: unknown): Record<string, unknown> | null {
    if (value == null) return null;

    if (typeof value === "string") {
        try {
            const parsed = JSON.parse(value);
            return parsed && typeof parsed === "object" && !Array.isArray(parsed)
                ? (parsed as Record<string, unknown>)
                : null;
        } catch {
            return null;
        }
    }

    if (typeof value === "object" && !Array.isArray(value)) {
        return value as Record<string, unknown>;
    }

    return null;
}

/**
 * Check if value is a valid InputJsonValue
 */
function isInputJsonValue(value: unknown): value is Prisma.InputJsonValue {
    if (value === null) return true;
    const t = typeof value;
    if (t === "string" || t === "number" || t === "boolean") return true;
    if (Array.isArray(value)) return value.every(isInputJsonValue);
    if (t === "object") {
        return Object.values(value as Record<string, unknown>).every(isInputJsonValue);
    }
    return false;
}

/**
 * Convert object to InputJsonValue
 */
function toInputJsonObject(
    value: Record<string, unknown> | null
): Record<string, Prisma.InputJsonValue> {
    if (!value) return {};
    const out: Record<string, Prisma.InputJsonValue> = {};
    for (const [k, v] of Object.entries(value)) {
        if (isInputJsonValue(v)) out[k] = v;
    }
    return out;
}

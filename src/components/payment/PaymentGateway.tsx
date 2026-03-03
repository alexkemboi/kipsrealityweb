"use client";
import { useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";

// Initialize Stripe outside component to avoid re-creation
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

interface PaymentGatewayProps {
    invoice: {
        id: string;
        amount: number;
        currency: string;
    };
}

export default function PaymentGateway({ invoice }: PaymentGatewayProps) {
    const [loading, setLoading] = useState(false);
    const [paymentData, setPaymentData] = useState<any>(null);

    // 1. Initialize Payment Request
    const handlePayNow = async () => {
        setLoading(true);
        try {
            const res = await fetch("/api/payments/initialize", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ invoiceId: invoice.id }),
            });
            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || "Payment initialization failed");
            }

            if (data.gateway === "PAYSTACK") {
                // SCENARIO A: Kenya (Redirection)
                // Paystack returns an authorization URL. We redirect the user there.
                if (data.checkoutUrl) {
                    window.location.href = data.checkoutUrl;
                } else {
                    console.error("Paystack URL missing", data);
                }
            } else if (data.gateway === "STRIPE") {
                // SCENARIO B: USA (Embedded)
                // Stripe returns a clientSecret. We save it to state to render the form.
                setPaymentData(data);
                setLoading(false);
            }
        } catch (error) {
            console.error("Payment Error:", error);
            setLoading(false);
            // Ideally show a toast notification here
        }
    };

    // If we have Stripe data, render the Stripe Form
    if (paymentData && paymentData.gateway === "STRIPE" && paymentData.clientSecret) {
        return (
            <Elements stripe={stripePromise} options={{ clientSecret: paymentData.clientSecret }}>
                <StripeCheckoutForm />
            </Elements>
        );
    }

    // Default View: The "Pay Now" Button
    return (
        <div className="w-full">
            <button
                onClick={handlePayNow}
                disabled={loading}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg w-full transition duration-300 ease-in-out transform hover:scale-105"
            >
                {loading ? "Processing..." : `Pay ${invoice.currency} ${invoice.amount}`}
            </button>
        </div>
    );
}

// Sub-component for Stripe Internal Form
function StripeCheckoutForm() {
    const stripe = useStripe();
    const elements = useElements();
    const [msg, setMsg] = useState("");
    const [isProcessing, setIsProcessing] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!stripe || !elements) return;

        setIsProcessing(true);

        const { error } = await stripe.confirmPayment({
            elements,
            confirmParams: {
                return_url: `${window.location.origin}/payment/success`,
            },
        });

        if (error) {
            setMsg(error.message || "An error occurred");
            setIsProcessing(false);
        }
        // Logic for success is handled by redirect
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4 p-4 border rounded-md shadow-sm">
            <PaymentElement />
            <button
                disabled={!stripe || isProcessing}
                className="bg-slate-900 text-white w-full py-2 rounded disabled:opacity-50"
            >
                {isProcessing ? "Processing..." : "Confirm Payment"}
            </button>
            {msg && <div className="text-red-500 text-sm">{msg}</div>}
        </form>
    );
}

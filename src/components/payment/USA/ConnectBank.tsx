"use client";
import { useState, useEffect, useCallback } from "react";
import { usePlaidLink, PlaidLinkOnSuccess, PlaidLinkOnExit } from "react-plaid-link";

interface ConnectBankProps {
    userId: string;
    onConnected: () => void;
}

export default function ConnectBank({ userId, onConnected }: ConnectBankProps) {
    const [token, setToken] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    // 1. Fetch Link Token on Mount
    useEffect(() => {
        async function createLinkToken() {
            try {
                const res = await fetch("/api/plaid/create-link-token", { method: "POST" });
                const data = await res.json();
                if (data.link_token) {
                    setToken(data.link_token);
                } else {
                    console.error("Failed to get link token", data);
                }
            } catch (e) {
                console.error("Error creating link token", e);
            }
        }
        createLinkToken();
    }, []);

    // 2. Handle Success (User selected bank)
    const onSuccess = useCallback<PlaidLinkOnSuccess>(async (publicToken, metadata) => {
        setLoading(true);
        try {
            // metadata contains account_id
            // We typically want the first account for simplicity in this MVP, 
            // or we could let the user select if we support multiple. 
            // Plaid Link usually lets user select one account if we configure it so.
            // metadata.accounts is an array.
            const accountId = metadata.accounts[0]?.id;

            if (!accountId) {
                throw new Error("No account selected");
            }

            await fetch("/api/plaid/exchange-token", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ publicToken, accountId, userId }),
            });

            onConnected(); // Refresh UI to show "Bank Connected"
        } catch (error) {
            console.error("Exchange token failed", error);
        } finally {
            setLoading(false);
        }
    }, [userId, onConnected]);

    const onExit = useCallback<PlaidLinkOnExit>((error, metadata) => {
        if (error) {
            console.error("Plaid Link exited with error", error);
        }
    }, []);

    const config: Parameters<typeof usePlaidLink>[0] = {
        token,
        onSuccess,
        onExit,
    };

    const { open, ready } = usePlaidLink(config);

    return (
        <div className="mt-4">
            <button
                onClick={() => open()}
                disabled={!ready || loading}
                className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded shadow-md transition-colors"
            >
                {loading ? "Connecting..." : "Connect Bank Account (ACH)"}
            </button>
        </div>
    );
}

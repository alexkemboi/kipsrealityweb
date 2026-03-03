import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/Getcurrentuser";
import { plaidClient } from "@/lib/payment/services/plaid-service";
import { CountryCode, Products } from "plaid";

export async function POST(req: Request) {
    const user = await getCurrentUser(); // Get User ID
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    try {
        const tokenResponse = await plaidClient.linkTokenCreate({
            user: { client_user_id: user.id },
            client_name: "RentFlow360",
            products: [Products.Auth],
            country_codes: [CountryCode.Us],
            language: 'en',
        });

        return NextResponse.json(tokenResponse.data);
    } catch (error) {
        console.error("Plaid Init Failed:", error);
        return NextResponse.json({ error: "Plaid Init Failed" }, { status: 500 });
    }
}

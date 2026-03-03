import { Region } from "@prisma/client";
import { IPaymentStrategy } from "./types";
import { KenyaPaymentStrategy } from "./strategies/kenya";
import { UsaPaymentStrategy } from "./strategies/usa";
import { MpesaPaymentStrategy } from "./strategies/mpesa";

export class PaymentFactory {
    /**
     * Returns the correct payment processor based on the Property/Landlord Region.
     */
    static getStrategy(region: Region): IPaymentStrategy {
        switch (region) {
            case "KEN":
                // Check if M-Pesa direct integration should be used
                const useMpesaDirect = process.env.USE_MPESA_DIRECT === "true" || 
                                      !!process.env.MPESA_CONSUMER_KEY;
                if (useMpesaDirect) {
                    return new MpesaPaymentStrategy();
                }
                return new KenyaPaymentStrategy();
            case "USA":
                return new UsaPaymentStrategy();
            default:
                // Default to Kenya logic for your pilot, or throw error
                return new KenyaPaymentStrategy();
        }
    }
}

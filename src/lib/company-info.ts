
import { prisma } from "@/lib/db";

export async function fetchCompanyInfo() {
    try {
        const policy = await prisma.policy.findFirst();
        return policy;
    } catch (error) {
        console.error("Error fetching company info:", error);
        return null;
    }
}

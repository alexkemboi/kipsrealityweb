import { redirect } from "next/navigation";
import { getCurrentUser } from "../Getcurrentuser";

/**
 * Server-side helper to ensure the user is logged in and has the AGENT role.
 * Redirects to /login if not authenticated, or /unauthorized if not an agent.
 */
export async function requireAgent() {
    const user = await getCurrentUser();

    if (!user) {
        redirect("/login");
    }

    if (user.role !== "AGENT" && user.role !== "SYSTEM_ADMIN") {
        redirect("/unauthorized");
    }

    return user;
}

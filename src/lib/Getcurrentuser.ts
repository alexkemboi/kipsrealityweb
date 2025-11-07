import { verifyAccessToken } from "./auth";
import { cookies } from "next/headers";

export async function getCurrentUser(req?: Request) {
  try {
    let token: string | null = null;

    // Try to get token from Authorization header first (for API calls)
    if (req) {
      const authHeader = req.headers.get("authorization");
      if (authHeader && authHeader.startsWith("Bearer ")) {
        token = authHeader.split(" ")[1];
      }
    }

    // If no token in header, try to get from cookies (for browser requests)
    if (!token) {
      const cookieStore = cookies();
      const tokenCookie = (await cookieStore).get("token");
      token = tokenCookie?.value || null;
    }

    if (!token) {
      return null;
    }

    const payload = verifyAccessToken(token);

    return {
      id: payload.userId,
      email: payload.email,
      role: payload.role,
      organizationId: payload.organizationId,
      organizationUserId: payload.organizationUserId
    };
  } catch (error) {
    console.error("getCurrentUser error:", error);
    return null;
  }
}
import { getCurrentUser } from "./Getcurrentuser";

export async function getAuthContext() {
  const user = await getCurrentUser();
  if (!user) {
    return null;
  }
  return {
    organizationId: user.organizationId,
  };
}
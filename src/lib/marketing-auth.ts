import { cookies } from "next/headers";
import { verifyToken } from "./auth";

export interface MarketingUser {
  id: string;
  name: string;
  email?: string;
}

export async function getMarketingUser(): Promise<MarketingUser | null> {
  const cookieStore = await cookies();

  // Try multiple cookie names for auth token
  const token =
    cookieStore.get("auth-token")?.value ||
    cookieStore.get("token")?.value;

  if (!token) {
    return null;
  }

  // Verify token using existing auth helper
  const payload = await verifyToken(token);
  if (!payload) {
    return null;
  }

  return {
    id: payload.sub,
    name: payload.email || "User",
    email: payload.email,
  };
}

export async function requireMarketingUser(): Promise<MarketingUser> {
  const user = await getMarketingUser();
  if (!user) {
    throw new Error("Unauthorized: Please login to access marketing features");
  }
  return user;
}
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

const ACCESS_TOKEN_SECRET = process.env.JWT_ACCESS_SECRET || "default_access_secret_shebabd_super_secure_key_12345";
const REFRESH_TOKEN_SECRET = process.env.JWT_REFRESH_SECRET || "default_refresh_secret_shebabd_super_secure_key_67890";

export const ACCESS_COOKIE_NAME = "sb_access_token";
export const REFRESH_COOKIE_NAME = "sb_refresh_token";

export interface TokenPayload {
  userId: string;
  email: string;
  role: "user" | "provider" | "admin";
  name: string;
}

export function signAccessToken(payload: TokenPayload): string {
  return jwt.sign(payload, ACCESS_TOKEN_SECRET, {
    expiresIn: "1h",
  });
}

export function signRefreshToken(payload: TokenPayload): string {
  return jwt.sign(payload, REFRESH_TOKEN_SECRET, {
    expiresIn: "7d",
  });
}

export function verifyAccessToken(token: string): TokenPayload | null {
  try {
    return jwt.verify(token, ACCESS_TOKEN_SECRET) as TokenPayload;
  } catch {
    return null;
  }
}

export function verifyRefreshToken(token: string): TokenPayload | null {
  try {
    return jwt.verify(token, REFRESH_TOKEN_SECRET) as TokenPayload;
  } catch {
    return null;
  }
}

export function setAuthCookies(
  res: NextResponse,
  accessToken: string,
  refreshToken: string
): void {
  const isProduction = process.env.NODE_ENV === "production";

  // Access Token (1 hour)
  res.cookies.set(ACCESS_COOKIE_NAME, accessToken, {
    httpOnly: true,
    secure: isProduction,
    sameSite: "strict",
    path: "/",
    maxAge: 60 * 60, // 1 hour
  });

  // Refresh Token (7 days)
  res.cookies.set(REFRESH_COOKIE_NAME, refreshToken, {
    httpOnly: true,
    secure: isProduction,
    sameSite: "strict",
    path: "/",
    maxAge: 7 * 24 * 60 * 60, // 7 days
  });
}

export function clearAuthCookies(res: NextResponse): void {
  res.cookies.set(ACCESS_COOKIE_NAME, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: 0,
  });

  res.cookies.set(REFRESH_COOKIE_NAME, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: 0,
  });
}

export async function getCurrentUser(): Promise<TokenPayload | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(ACCESS_COOKIE_NAME)?.value;
    if (!token) return null;
    return verifyAccessToken(token);
  } catch {
    return null;
  }
}

export interface TwoFactorTokenPayload {
  userId: string;
  email: string;
  type: "2fa_pending";
}

export function signTwoFactorToken(payload: { userId: string; email: string }): string {
  return jwt.sign({ ...payload, type: "2fa_pending" }, ACCESS_TOKEN_SECRET, {
    expiresIn: "10m",
  });
}

export function verifyTwoFactorToken(token: string): { userId: string; email: string } | null {
  try {
    const decoded = jwt.verify(token, ACCESS_TOKEN_SECRET) as TwoFactorTokenPayload;
    if (decoded.type !== "2fa_pending") return null;
    return { userId: decoded.userId, email: decoded.email };
  } catch {
    return null;
  }
}

export function maskEmail(email: string): string {
  if (!email || !email.includes("@")) return email;
  const [local, domain] = email.split("@");
  if (local.length <= 2) {
    return `${local[0]}***@${domain}`;
  }
  return `${local[0]}***${local[local.length - 1]}@${domain}`;
}

export function maskPhone(phone: string): string {
  if (!phone || phone.length < 7) return phone;
  const start = phone.slice(0, 3);
  const end = phone.slice(-4);
  return `${start}****${end}`;
}


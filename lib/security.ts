import bcrypt from "bcryptjs";

// Rate Limiter implementation (sliding window / token counter)
interface RateLimitRecord {
  count: number;
  resetTime: number;
}

const rateLimitMap = new Map<string, RateLimitRecord>();

// Clean up stale entries every 5 minutes
if (typeof setInterval !== "undefined") {
  setInterval(() => {
    const now = Date.now();
    for (const [key, record] of rateLimitMap.entries()) {
      if (now > record.resetTime) {
        rateLimitMap.delete(key);
      }
    }
  }, 5 * 60 * 1000);
}

export function checkRateLimit(
  identifier: string,
  limit: number = 60,
  windowMs: number = 60 * 1000
): { allowed: boolean; remaining: number; resetTime: number } {
  const now = Date.now();
  const record = rateLimitMap.get(identifier);

  if (!record || now > record.resetTime) {
    rateLimitMap.set(identifier, {
      count: 1,
      resetTime: now + windowMs,
    });
    return { allowed: true, remaining: limit - 1, resetTime: now + windowMs };
  }

  if (record.count >= limit) {
    return { allowed: false, remaining: 0, resetTime: record.resetTime };
  }

  record.count += 1;
  return {
    allowed: true,
    remaining: limit - record.count,
    resetTime: record.resetTime,
  };
}

// Password Hashing & Verification
export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(12);
  return bcrypt.hash(password, salt);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

// Input Sanitization to prevent NoSQL injection & XSS
export function sanitizeInput<T>(input: T): T {
  if (typeof input === "string") {
    // Strip script tags and HTML special tags
    return input
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
      .replace(/[<>]/g, "")
      .trim() as unknown as T;
  }

  if (Array.isArray(input)) {
    return input.map((item) => sanitizeInput(item)) as unknown as T;
  }

  if (input !== null && typeof input === "object") {
    const sanitizedObj: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(input)) {
      // Reject NoSQL injection operators starting with $
      if (key.startsWith("$")) {
        continue;
      }
      sanitizedObj[key] = sanitizeInput(value);
    }
    return sanitizedObj as T;
  }

  return input;
}

// CSRF Check for API mutations
export function verifyCsrf(req: Request): boolean {
  // If GET/HEAD/OPTIONS, CSRF is not required
  if (["GET", "HEAD", "OPTIONS"].includes(req.method)) {
    return true;
  }

  const origin = req.headers.get("origin");
  const referer = req.headers.get("referer");
  const host = req.headers.get("host");

  if (!origin && !referer) {
    // If no origin or referer, check for custom header
    return !!req.headers.get("x-requested-with") || !!req.headers.get("x-csrf-token");
  }

  const requestHost = origin ? new URL(origin).host : referer ? new URL(referer).host : null;
  return requestHost === host;
}

// Account Lockout Config
export const LOCKOUT_CONFIG = {
  MAX_FAILED_ATTEMPTS: 5,
  LOCK_TIME_MS: 15 * 60 * 1000, // 15 minutes
};

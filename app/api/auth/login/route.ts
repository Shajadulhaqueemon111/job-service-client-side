import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import { User, Provider } from "@/models";
import { LoginSchema } from "@/validators/auth";
import { verifyPassword, sanitizeInput, checkRateLimit, LOCKOUT_CONFIG } from "@/lib/security";
import {
  signAccessToken,
  signRefreshToken,
  setAuthCookies,
  signTwoFactorToken,
  maskEmail,
  maskPhone,
} from "@/lib/auth";
import { createAuditLog } from "@/lib/audit";

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get("x-forwarded-for") || "local_ip";
    const rateCheck = checkRateLimit(`login_${ip}`, 8, 60 * 1000);
    if (!rateCheck.allowed) {
      return NextResponse.json(
        { success: false, error: "Too many login attempts. Please wait a moment and try again." },
        { status: 429 }
      );
    }

    const body = await req.json();
    const sanitized = sanitizeInput(body);

    const validation = LoginSchema.safeParse(sanitized);
    if (!validation.success) {
      return NextResponse.json(
        { success: false, error: "Invalid email or password format." },
        { status: 400 }
      );
    }

    const { email, password } = validation.data;

    await connectDB();

    // Query user and explicitly select password, lockout, and 2FA fields
    const user = await User.findOne({ email: email.toLowerCase() }).select(
      "+password +twoFactorCode +twoFactorExpires +twoFactorAttempts"
    );

    // Generic error message for security
    const genericAuthError = "Invalid email or password.";

    if (!user) {
      return NextResponse.json({ success: false, error: genericAuthError }, { status: 401 });
    }

    // Check if account is blocked by admin
    if (user.status === "blocked") {
      return NextResponse.json(
        { success: false, error: "Your account has been suspended. Please contact support." },
        { status: 403 }
      );
    }

    // Check account lockout
    if (user.lockUntil && user.lockUntil > new Date()) {
      const waitMinutes = Math.ceil((user.lockUntil.getTime() - Date.now()) / (60 * 1000));
      return NextResponse.json(
        {
          success: false,
          error: `Account is temporarily locked due to multiple failed login attempts. Please try again in ${waitMinutes} minutes.`,
        },
        { status: 423 }
      );
    }

    // Verify Password
    const isPasswordValid = await verifyPassword(password, user.password || "");

    if (!isPasswordValid) {
      // Increment failed attempts
      user.failedLoginAttempts = (user.failedLoginAttempts || 0) + 1;

      if (user.failedLoginAttempts >= LOCKOUT_CONFIG.MAX_FAILED_ATTEMPTS) {
        user.lockUntil = new Date(Date.now() + LOCKOUT_CONFIG.LOCK_TIME_MS);
      }

      await user.save();

      await createAuditLog({
        userId: user._id.toString(),
        userEmail: user.email,
        userName: user.name,
        userRole: user.role,
        action: "LOGIN_FAILED",
        description: `Failed login attempt for ${user.email} (incorrect password)`,
        ipAddress: ip,
        status: "failure",
      });

      return NextResponse.json({ success: false, error: genericAuthError }, { status: 401 });
    }

    // Two-Step Verification is active for all accounts (default: true)
    const is2FAEnabled = user.twoFactorEnabled !== false;

    if (is2FAEnabled) {
      // Generate 6-digit OTP code
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      user.twoFactorCode = otp;
      user.twoFactorExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes expiry
      user.twoFactorAttempts = 0;
      await user.save();

      console.log(`[2FA OTP] Verification code for ${user.email}: ${otp}`);

      await createAuditLog({
        userId: user._id.toString(),
        userEmail: user.email,
        userName: user.name,
        userRole: user.role,
        action: "2FA_OTP_GENERATED",
        description: `2-Step verification OTP generated for ${user.email}`,
        ipAddress: ip,
        status: "success",
      });

      const tempToken = signTwoFactorToken({
        userId: user._id.toString(),
        email: user.email,
      });

      return NextResponse.json({
        success: true,
        requires2FA: true,
        tempToken,
        email: maskEmail(user.email),
        phone: maskPhone(user.phone),
        demoOtp: otp, // For local dev/demo testing
        message: "Two-step verification code generated.",
      });
    }

    // Fallback if 2FA is explicitly disabled
    user.failedLoginAttempts = 0;
    user.lockUntil = null;
    await user.save();

    // Check if provider
    let providerId: string | undefined;
    if (user.role === "provider") {
      const providerDoc = await Provider.findOne({ user: user._id }).select("_id").lean();
      if (providerDoc) {
        providerId = providerDoc._id.toString();
      }
    }

    const tokenPayload = {
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
      name: user.name,
    };

    const accessToken = signAccessToken(tokenPayload);
    const refreshToken = signRefreshToken(tokenPayload);

    const res = NextResponse.json({
      success: true,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        status: user.status,
        avatar: user.avatar,
        providerId,
      },
      message: "Login successful!",
    });

    setAuthCookies(res, accessToken, refreshToken);
    return res;
  } catch (error) {
    console.error("Login Error:", error);
    return NextResponse.json(
      { success: false, error: "An internal server error occurred." },
      { status: 500 }
    );
  }
}

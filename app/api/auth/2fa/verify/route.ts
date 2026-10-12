import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import { User, Provider } from "@/models";
import {
  verifyTwoFactorToken,
  signAccessToken,
  signRefreshToken,
  setAuthCookies,
} from "@/lib/auth";
import { checkRateLimit, sanitizeInput } from "@/lib/security";
import { createAuditLog } from "@/lib/audit";

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get("x-forwarded-for") || "local_ip";
    const rateCheck = checkRateLimit(`2fa_verify_${ip}`, 15, 60 * 1000);
    if (!rateCheck.allowed) {
      return NextResponse.json(
        { success: false, error: "Too many verification attempts. Please wait a moment." },
        { status: 429 }
      );
    }

    const body = await req.json();
    const sanitized = sanitizeInput(body);
    const { tempToken, code } = sanitized;

    if (!tempToken || typeof tempToken !== "string") {
      return NextResponse.json(
        { success: false, error: "Missing or invalid session token. Please log in again." },
        { status: 401 }
      );
    }

    if (!code || typeof code !== "string" || code.trim().length !== 6) {
      return NextResponse.json(
        { success: false, error: "Please enter a valid 6-digit verification code." },
        { status: 400 }
      );
    }

    const tokenData = verifyTwoFactorToken(tempToken);
    if (!tokenData) {
      return NextResponse.json(
        { success: false, error: "Verification session has expired. Please log in again." },
        { status: 401 }
      );
    }

    await connectDB();

    const user = await User.findById(tokenData.userId).select(
      "+twoFactorCode +twoFactorExpires +twoFactorAttempts"
    );

    if (!user) {
      return NextResponse.json(
        { success: false, error: "User account not found." },
        { status: 404 }
      );
    }

    if (user.status === "blocked") {
      return NextResponse.json(
        { success: false, error: "Your account has been suspended. Please contact support." },
        { status: 403 }
      );
    }

    // Check failed attempts for this code
    if ((user.twoFactorAttempts || 0) >= 5) {
      user.twoFactorCode = null;
      user.twoFactorExpires = null;
      user.twoFactorAttempts = 0;
      await user.save();
      return NextResponse.json(
        {
          success: false,
          error: "Too many invalid attempts. The code has been invalidated. Please log in again.",
        },
        { status: 400 }
      );
    }

    // Check expiration
    if (!user.twoFactorExpires || user.twoFactorExpires < new Date()) {
      return NextResponse.json(
        {
          success: false,
          error: "Verification code has expired. Please request a new code.",
        },
        { status: 400 }
      );
    }

    // Verify code match
    const cleanCode = code.trim();
    if (user.twoFactorCode !== cleanCode) {
      user.twoFactorAttempts = (user.twoFactorAttempts || 0) + 1;
      await user.save();
      const remaining = 5 - user.twoFactorAttempts;

      await createAuditLog({
        userId: user._id.toString(),
        userEmail: user.email,
        userName: user.name,
        userRole: user.role,
        action: "2FA_VERIFICATION_FAILED",
        description: `Invalid 2FA OTP code entered for ${user.email} (${remaining} attempts left)`,
        ipAddress: ip,
        status: "failure",
      });

      return NextResponse.json(
        {
          success: false,
          error: `Invalid verification code. ${remaining > 0 ? `${remaining} attempts remaining.` : "Please request a new code."}`,
        },
        { status: 400 }
      );
    }

    // Code is valid: clear 2FA temporary fields and reset lockout counters
    user.twoFactorCode = null;
    user.twoFactorExpires = null;
    user.twoFactorAttempts = 0;
    user.failedLoginAttempts = 0;
    user.lockUntil = null;
    await user.save();

    await createAuditLog({
      userId: user._id.toString(),
      userEmail: user.email,
      userName: user.name,
      userRole: user.role,
      action: "USER_LOGIN",
      description: `User ${user.name} successfully authenticated with 2-Step Verification`,
      ipAddress: ip,
      status: "success",
    });

    // Check provider profile
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
      message: "Two-step verification successful!",
    });

    setAuthCookies(res, accessToken, refreshToken);
    return res;
  } catch (error) {
    console.error("2FA Verify Error:", error);
    return NextResponse.json(
      { success: false, error: "An internal server error occurred during verification." },
      { status: 500 }
    );
  }
}

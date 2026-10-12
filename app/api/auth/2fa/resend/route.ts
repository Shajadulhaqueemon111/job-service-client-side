import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import { User } from "@/models";
import { verifyTwoFactorToken } from "@/lib/auth";
import { checkRateLimit, sanitizeInput } from "@/lib/security";

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get("x-forwarded-for") || "local_ip";
    const body = await req.json();
    const sanitized = sanitizeInput(body);
    const { tempToken } = sanitized;

    if (!tempToken || typeof tempToken !== "string") {
      return NextResponse.json(
        { success: false, error: "Invalid session token. Please log in again." },
        { status: 401 }
      );
    }

    const tokenData = verifyTwoFactorToken(tempToken);
    if (!tokenData) {
      return NextResponse.json(
        { success: false, error: "Session expired. Please log in again." },
        { status: 401 }
      );
    }

    // Rate limit resend to 1 request per 30 seconds per user
    const rateCheck = checkRateLimit(`2fa_resend_${tokenData.userId}`, 2, 30 * 1000);
    if (!rateCheck.allowed) {
      return NextResponse.json(
        {
          success: false,
          error: "Please wait 30 seconds before requesting a new verification code.",
        },
        { status: 429 }
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
        { success: false, error: "Your account has been suspended." },
        { status: 403 }
      );
    }

    const newOtp = Math.floor(100000 + Math.random() * 900000).toString();
    user.twoFactorCode = newOtp;
    user.twoFactorExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
    user.twoFactorAttempts = 0;
    await user.save();

    console.log(`[2FA OTP RESEND] New verification code for ${user.email}: ${newOtp}`);

    return NextResponse.json({
      success: true,
      message: "A new 6-digit verification code has been sent.",
      demoOtp: newOtp,
    });
  } catch (error) {
    console.error("2FA Resend Error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to resend verification code. Please try again." },
      { status: 500 }
    );
  }
}

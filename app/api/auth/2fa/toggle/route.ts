import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import { User } from "@/models";
import { getCurrentUser } from "@/lib/auth";
import { verifyPassword, sanitizeInput } from "@/lib/security";

export async function POST(req: NextRequest) {
  try {
    const session = await getCurrentUser();
    if (!session) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { enabled, password } = sanitizeInput(body);

    if (typeof enabled !== "boolean") {
      return NextResponse.json(
        { success: false, error: "Invalid status value provided." },
        { status: 400 }
      );
    }

    if (!password) {
      return NextResponse.json(
        { success: false, error: "Password is required to change security settings." },
        { status: 400 }
      );
    }

    await connectDB();
    const user = await User.findById(session.userId).select("+password");
    if (!user) {
      return NextResponse.json({ success: false, error: "User not found." }, { status: 404 });
    }

    const isMatch = await verifyPassword(password, user.password || "");
    if (!isMatch) {
      return NextResponse.json(
        { success: false, error: "Incorrect password. Cannot update 2-step verification settings." },
        { status: 403 }
      );
    }

    user.twoFactorEnabled = enabled;
    user.twoFactorCode = null;
    user.twoFactorExpires = null;
    await user.save();

    return NextResponse.json({
      success: true,
      twoFactorEnabled: user.twoFactorEnabled,
      message: enabled
        ? "Two-step verification has been enabled for your account."
        : "Two-step verification has been disabled.",
    });
  } catch (error) {
    console.error("2FA Toggle Error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update two-step verification settings." },
      { status: 500 }
    );
  }
}

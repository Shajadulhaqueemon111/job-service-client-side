import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import { User } from "@/models";
import { getCurrentUser } from "@/lib/auth";
import { hashPassword, verifyPassword, sanitizeInput } from "@/lib/security";
import { ChangePasswordSchema } from "@/validators/auth";
import { createAuditLog } from "@/lib/audit";

export async function POST(req: NextRequest) {
  try {
    const session = await getCurrentUser();
    if (!session) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const ip = req.headers.get("x-forwarded-for") || "local_ip";
    const userAgent = req.headers.get("user-agent") || "";

    const body = await req.json();
    const sanitized = sanitizeInput(body);

    const validation = ChangePasswordSchema.safeParse(sanitized);
    if (!validation.success) {
      return NextResponse.json(
        { success: false, error: validation.error.errors[0]?.message || "Invalid password data" },
        { status: 400 }
      );
    }

    const { currentPassword, newPassword } = validation.data;

    await connectDB();
    const user = await User.findById(session.userId).select("+password");
    if (!user) {
      return NextResponse.json({ success: false, error: "User not found" }, { status: 404 });
    }

    const isMatch = await verifyPassword(currentPassword, user.password || "");
    if (!isMatch) {
      await createAuditLog({
        userId: user._id.toString(),
        userEmail: user.email,
        userName: user.name,
        userRole: user.role,
        action: "PASSWORD_CHANGE_FAILED",
        description: "Failed password change attempt: Incorrect current password provided",
        ipAddress: ip,
        userAgent,
        status: "failure",
      });

      return NextResponse.json(
        { success: false, error: "Current password does not match. Please verify and try again." },
        { status: 400 }
      );
    }

    const hashedPassword = await hashPassword(newPassword);
    user.password = hashedPassword;
    user.failedLoginAttempts = 0;
    user.lockUntil = null;
    await user.save();

    await createAuditLog({
      userId: user._id.toString(),
      userEmail: user.email,
      userName: user.name,
      userRole: user.role,
      action: "PASSWORD_CHANGED",
      description: `User ${user.name} successfully changed their account password`,
      ipAddress: ip,
      userAgent,
      status: "success",
    });

    return NextResponse.json({
      success: true,
      message: "Password changed successfully!",
    });
  } catch (error) {
    console.error("Change Password Error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to change password. Please try again." },
      { status: 500 }
    );
  }
}

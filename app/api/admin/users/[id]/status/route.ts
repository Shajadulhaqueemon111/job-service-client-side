import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import { User } from "@/models";
import { getCurrentUser } from "@/lib/auth";
import { createAuditLog } from "@/lib/audit";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getCurrentUser();
    if (!session || session.role !== "admin") {
      return NextResponse.json({ success: false, error: "Forbidden: Admin access required" }, { status: 403 });
    }

    const { id } = await params;
    const body = await req.json();
    const { status } = body; // 'active' | 'blocked'

    if (!["active", "blocked"].includes(status)) {
      return NextResponse.json({ success: false, error: "Invalid status" }, { status: 400 });
    }

    await connectDB();
    const user = await User.findById(id);
    if (!user) {
      return NextResponse.json({ success: false, error: "User not found" }, { status: 404 });
    }

    // Protect admin from blocking self
    if (user._id.toString() === session.userId) {
      return NextResponse.json({ success: false, error: "Cannot modify your own admin account status" }, { status: 400 });
    }

    user.status = status;
    await user.save();

    await createAuditLog({
      userId: session.userId,
      userEmail: session.email,
      userName: session.name,
      userRole: "admin",
      action: "USER_STATUS_CHANGED",
      description: `Admin ${session.name} updated account status of ${user.email} to '${status}'`,
      status: "warning",
      details: { targetUserId: user._id.toString(), targetEmail: user.email, newStatus: status },
    });

    return NextResponse.json({
      success: true,
      user: { _id: user._id, status: user.status },
      message: `User status changed to ${status}`,
    });
  } catch (error) {
    console.error("Update user status error:", error);
    return NextResponse.json({ success: false, error: "Failed to update user status" }, { status: 500 });
  }
}

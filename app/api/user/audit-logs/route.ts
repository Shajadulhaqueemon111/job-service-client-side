import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import { AuditLog } from "@/models";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
  try {
    const session = await getCurrentUser();
    if (!session) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const logs = await AuditLog.find({
      $or: [{ userId: session.userId }, { userEmail: session.email }],
    })
      .sort({ createdAt: -1 })
      .limit(20)
      .lean();

    return NextResponse.json({ success: true, logs });
  } catch (error) {
    console.error("User Audit Logs Error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch activity logs" },
      { status: 500 }
    );
  }
}

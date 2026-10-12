import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import { AuditLog } from "@/models";
import { getCurrentUser } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const session = await getCurrentUser();
    if (!session || session.role !== "admin") {
      return NextResponse.json(
        { success: false, error: "Forbidden: Admin access required" },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(req.url);
    const action = searchParams.get("action");
    const status = searchParams.get("status");
    const search = searchParams.get("search");
    const dateParam = searchParams.get("date");
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const limit = Math.max(1, Math.min(100, parseInt(searchParams.get("limit") || "30")));
    const skip = (page - 1) * limit;

    await connectDB();

    const query: Record<string, unknown> = {};
    if (action && action !== "all") query.action = action;
    if (status && status !== "all") query.status = status;
    if (dateParam) {
      const start = new Date(dateParam);
      start.setHours(0, 0, 0, 0);
      const end = new Date(dateParam);
      end.setHours(23, 59, 59, 999);
      if (!isNaN(start.getTime()) && !isNaN(end.getTime())) {
        query.createdAt = { $gte: start, $lte: end };
      }
    }
    if (search && search.trim()) {
      const q = search.trim();
      query.$or = [
        { userEmail: { $regex: q, $options: "i" } },
        { userName: { $regex: q, $options: "i" } },
        { description: { $regex: q, $options: "i" } },
        { ipAddress: { $regex: q, $options: "i" } },
      ];
    }

    const [logs, total] = await Promise.all([
      AuditLog.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      AuditLog.countDocuments(query),
    ]);

    return NextResponse.json({
      success: true,
      logs,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error("Admin Audit Logs Error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch audit logs" },
      { status: 500 }
    );
  }
}

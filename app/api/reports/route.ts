import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import { Report } from "@/models";
import { getCurrentUser } from "@/lib/auth";
import { CreateReportSchema } from "@/validators/review";
import { sanitizeInput } from "@/lib/security";

export async function GET() {
  try {
    const session = await getCurrentUser();
    if (!session || session.role !== "admin") {
      return NextResponse.json({ success: false, error: "Forbidden: Admin access required" }, { status: 403 });
    }

    await connectDB();
    const reports = await Report.find()
      .populate("reporter", "name email")
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({ success: true, reports });
  } catch (error) {
    console.error("Fetch Reports Error:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch reports" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getCurrentUser();
    if (!session) {
      return NextResponse.json({ success: false, error: "Please log in to submit a report" }, { status: 401 });
    }

    const body = await req.json();
    const sanitized = sanitizeInput(body);

    const validation = CreateReportSchema.safeParse(sanitized);
    if (!validation.success) {
      return NextResponse.json(
        { success: false, error: validation.error.errors[0]?.message },
        { status: 400 }
      );
    }

    const { targetType, targetId, reason, details } = validation.data;

    await connectDB();
    const newReport = await Report.create({
      reporter: session.userId,
      targetType,
      targetId,
      reason,
      details: details || "",
      status: "pending",
    });

    return NextResponse.json(
      { success: true, report: newReport, message: "Report submitted to admin moderation" },
      { status: 201 }
    );
  } catch (error) {
    console.error("Create Report Error:", error);
    return NextResponse.json({ success: false, error: "Failed to submit report" }, { status: 500 });
  }
}

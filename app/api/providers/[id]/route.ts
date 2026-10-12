import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import { Provider, Review } from "@/models";
import { getCurrentUser } from "@/lib/auth";
import { ProviderProfileSchema } from "@/validators/provider";
import { sanitizeInput } from "@/lib/security";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await connectDB();

    const provider = await Provider.findById(id)
      .populate("user", "name email avatar phone")
      .populate("category", "name nameBn icon slug")
      .populate("areas", "areaName areaNameBn district upazila")
      .lean();

    if (!provider) {
      return NextResponse.json(
        { success: false, error: "Provider not found" },
        { status: 404 }
      );
    }

    // Fetch reviews for this provider
    const reviews = await Review.find({ provider: id, isFlagged: false })
      .populate("user", "name avatar")
      .sort({ createdAt: -1 })
      .limit(30)
      .lean();

    return NextResponse.json({
      success: true,
      provider,
      reviews,
    });
  } catch (error) {
    console.error("Get Provider Detail Error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to get provider details" },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getCurrentUser();
    if (!session) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    await connectDB();

    const provider = await Provider.findById(id);
    if (!provider) {
      return NextResponse.json({ success: false, error: "Provider not found" }, { status: 404 });
    }

    // Check ownership or admin
    if (provider.user.toString() !== session.userId && session.role !== "admin") {
      return NextResponse.json({ success: false, error: "Forbidden: Not allowed" }, { status: 403 });
    }

    const body = await req.json();
    const sanitized = sanitizeInput(body);

    const validation = ProviderProfileSchema.partial().safeParse(sanitized);
    if (!validation.success) {
      return NextResponse.json(
        { success: false, error: validation.error.errors[0]?.message },
        { status: 400 }
      );
    }

    Object.assign(provider, validation.data);
    await provider.save();

    return NextResponse.json({
      success: true,
      provider,
      message: "Provider profile updated successfully",
    });
  } catch (error) {
    console.error("Update Provider Error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update provider" },
      { status: 500 }
    );
  }
}

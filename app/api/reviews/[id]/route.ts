import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import { Review, Provider } from "@/models";
import { getCurrentUser } from "@/lib/auth";
import { ProviderReplySchema } from "@/validators/review";
import { sanitizeInput } from "@/lib/security";

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getCurrentUser();
    if (!session || session.role !== "admin") {
      return NextResponse.json({ success: false, error: "Forbidden: Admin access required" }, { status: 403 });
    }

    const { id } = await params;
    await connectDB();

    const review = await Review.findByIdAndDelete(id);
    if (!review) {
      return NextResponse.json({ success: false, error: "Review not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: "Review deleted successfully" });
  } catch (error) {
    console.error("Delete Review Error:", error);
    return NextResponse.json({ success: false, error: "Failed to delete review" }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getCurrentUser();
    if (!session) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();
    const sanitized = sanitizeInput(body);

    const validation = ProviderReplySchema.safeParse(sanitized);
    if (!validation.success) {
      return NextResponse.json(
        { success: false, error: validation.error.errors[0]?.message },
        { status: 400 }
      );
    }

    await connectDB();
    const review = await Review.findById(id);
    if (!review) {
      return NextResponse.json({ success: false, error: "Review not found" }, { status: 404 });
    }

    const provider = await Provider.findById(review.provider);
    if (!provider || (provider.user.toString() !== session.userId && session.role !== "admin")) {
      return NextResponse.json({ success: false, error: "Forbidden: Not allowed" }, { status: 403 });
    }

    review.providerResponse = validation.data.response;
    await review.save();

    return NextResponse.json({ success: true, review, message: "Response saved successfully" });
  } catch (error) {
    console.error("Reply Review Error:", error);
    return NextResponse.json({ success: false, error: "Failed to save response" }, { status: 500 });
  }
}

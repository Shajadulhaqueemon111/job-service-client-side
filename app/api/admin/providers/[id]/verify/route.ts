import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import { Provider } from "@/models";
import { getCurrentUser } from "@/lib/auth";

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
    const { action, isVerified } = body; // action: 'approve' | 'reject' | 'toggleVerified'

    await connectDB();
    const provider = await Provider.findById(id);
    if (!provider) {
      return NextResponse.json({ success: false, error: "Provider not found" }, { status: 404 });
    }

    if (action === "approve") {
      provider.verificationStatus = "approved";
      provider.isVerified = true;
    } else if (action === "reject") {
      provider.verificationStatus = "rejected";
      provider.isVerified = false;
    } else if (isVerified !== undefined) {
      provider.isVerified = !!isVerified;
      if (provider.isVerified && provider.verificationStatus !== "approved") {
        provider.verificationStatus = "approved";
      }
    }

    await provider.save();

    return NextResponse.json({
      success: true,
      provider,
      message: `Provider status updated: ${provider.verificationStatus} (Verified: ${provider.isVerified})`,
    });
  } catch (error) {
    console.error("Provider verify error:", error);
    return NextResponse.json({ success: false, error: "Failed to update verification status" }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import { ServiceRequest, Provider } from "@/models";
import { getCurrentUser } from "@/lib/auth";
import { UpdateRequestStatusSchema } from "@/validators/request";
import { sanitizeInput } from "@/lib/security";

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

    const validation = UpdateRequestStatusSchema.safeParse(sanitized);
    if (!validation.success) {
      return NextResponse.json(
        { success: false, error: validation.error.errors[0]?.message },
        { status: 400 }
      );
    }

    const { status, cancellationReason, providerNotes, finalPrice } = validation.data;

    await connectDB();

    const request = await ServiceRequest.findById(id);
    if (!request) {
      return NextResponse.json({ success: false, error: "Request not found" }, { status: 404 });
    }

    const provider = await Provider.findById(request.provider);

    // Permission checks based on role
    const isCustomerOwner = request.user.toString() === session.userId;
    const isProviderOwner = provider && provider.user.toString() === session.userId;
    const isAdmin = session.role === "admin";

    if (!isCustomerOwner && !isProviderOwner && !isAdmin) {
      return NextResponse.json({ success: false, error: "Forbidden: Not authorized" }, { status: 403 });
    }

    // Role-specific allowed transitions:
    // User can only cancel if pending
    if (isCustomerOwner && !isProviderOwner && !isAdmin) {
      if (status !== "cancelled") {
        return NextResponse.json(
          { success: false, error: "Customers can only cancel a pending request." },
          { status: 400 }
        );
      }
      if (request.status !== "pending") {
        return NextResponse.json(
          { success: false, error: "Cannot cancel a request that is already accepted or finished." },
          { status: 400 }
        );
      }
    }

    // Provider can accept, reject, complete
    if (isProviderOwner && !isAdmin) {
      if (["accepted", "rejected"].includes(status) && request.status !== "pending") {
        return NextResponse.json(
          { success: false, error: "Can only accept or reject a pending request." },
          { status: 400 }
        );
      }
      if (status === "completed" && request.status !== "accepted") {
        return NextResponse.json(
          { success: false, error: "Can only complete an accepted request." },
          { status: 400 }
        );
      }
    }

    // Update fields
    request.status = status;
    if (cancellationReason) request.cancellationReason = cancellationReason;
    if (providerNotes) request.providerNotes = providerNotes;
    if (finalPrice !== undefined) request.finalPrice = finalPrice;

    await request.save();

    // If marked completed, increment provider's completedJobsCount
    if (status === "completed" && provider) {
      await Provider.findByIdAndUpdate(provider._id, {
        $inc: { completedJobsCount: 1 },
      });
    }

    return NextResponse.json({
      success: true,
      request,
      message: `Request status updated to ${status}`,
    });
  } catch (error) {
    console.error("Update Request Status Error:", error);
    return NextResponse.json({ success: false, error: "Failed to update request status" }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import { Review, ServiceRequest, Provider } from "@/models";
import { getCurrentUser } from "@/lib/auth";
import { CreateReviewSchema } from "@/validators/review";
import { sanitizeInput } from "@/lib/security";
import mongoose from "mongoose";

export async function POST(req: NextRequest) {
  try {
    const session = await getCurrentUser();
    if (!session) {
      return NextResponse.json({ success: false, error: "Please log in to submit a review" }, { status: 401 });
    }

    const body = await req.json();
    const sanitized = sanitizeInput(body);

    const validation = CreateReviewSchema.safeParse(sanitized);
    if (!validation.success) {
      return NextResponse.json(
        { success: false, error: validation.error.errors[0]?.message },
        { status: 400 }
      );
    }

    const { serviceRequestId, rating, comment } = validation.data;

    await connectDB();

    // Verify service request exists and belongs to current user
    const serviceRequest = await ServiceRequest.findById(serviceRequestId);
    if (!serviceRequest) {
      return NextResponse.json({ success: false, error: "Service request not found" }, { status: 404 });
    }

    if (serviceRequest.user.toString() !== session.userId) {
      return NextResponse.json(
        { success: false, error: "You can only review services requested by your account" },
        { status: 403 }
      );
    }

    // Must be completed
    if (serviceRequest.status !== "completed") {
      return NextResponse.json(
        { success: false, error: "Reviews can only be given after the service request is marked as completed." },
        { status: 400 }
      );
    }

    // Check if already reviewed
    const existingReview = await Review.findOne({ serviceRequest: serviceRequestId });
    if (existingReview || serviceRequest.hasReview) {
      return NextResponse.json(
        { success: false, error: "You have already submitted a review for this service request." },
        { status: 409 }
      );
    }

    // Create Review
    const newReview = await Review.create({
      user: session.userId,
      provider: serviceRequest.provider,
      serviceRequest: serviceRequest._id,
      rating,
      comment,
      isFlagged: false,
    });

    // Mark request as reviewed
    serviceRequest.hasReview = true;
    await serviceRequest.save();

    // Recalculate provider average rating and reviewCount
    const stats = await Review.aggregate([
      { $match: { provider: new mongoose.Types.ObjectId(serviceRequest.provider.toString()), isFlagged: false } },
      {
        $group: {
          _id: "$provider",
          avgRating: { $avg: "$rating" },
          totalReviews: { $sum: 1 },
        },
      },
    ]);

    if (stats.length > 0) {
      const avg = Math.round(stats[0].avgRating * 10) / 10;
      await Provider.findByIdAndUpdate(serviceRequest.provider, {
        rating: avg,
        reviewCount: stats[0].totalReviews,
      });
    }

    return NextResponse.json(
      {
        success: true,
        review: newReview,
        message: "Thank you! Your review has been published.",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Create Review Error:", error);
    return NextResponse.json({ success: false, error: "Failed to post review" }, { status: 500 });
  }
}

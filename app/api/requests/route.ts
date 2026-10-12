import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import { ServiceRequest, Provider } from "@/models";
import { getCurrentUser } from "@/lib/auth";
import { CreateServiceRequestSchema } from "@/validators/request";
import { sanitizeInput, checkRateLimit } from "@/lib/security";

export async function GET() {
  try {
    const session = await getCurrentUser();
    if (!session) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    let query = {};
    if (session.role === "admin") {
      query = {};
    } else if (session.role === "provider") {
      const providerDoc = await Provider.findOne({ user: session.userId }).select("_id").lean();
      if (!providerDoc) {
        return NextResponse.json({ success: true, requests: [] });
      }
      query = { provider: providerDoc._id };
    } else {
      // Customer
      query = { user: session.userId };
    }

    const requests = await ServiceRequest.find(query)
      .populate("user", "name email phone avatar")
      .populate({
        path: "provider",
        select: "businessTitle phone rating isVerified user category",
        populate: [
          { path: "user", select: "name avatar" },
          { path: "category", select: "name nameBn icon" },
        ],
      })
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({ success: true, requests });
  } catch (error) {
    console.error("Fetch Requests Error:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch requests" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getCurrentUser();
    if (!session) {
      return NextResponse.json({ success: false, error: "Please log in to request a service" }, { status: 401 });
    }

    const rateCheck = checkRateLimit(`req_${session.userId}`, 10, 60 * 1000);
    if (!rateCheck.allowed) {
      return NextResponse.json(
        { success: false, error: "Too many requests. Please wait a minute." },
        { status: 429 }
      );
    }

    const body = await req.json();
    const sanitized = sanitizeInput(body);

    const validation = CreateServiceRequestSchema.safeParse(sanitized);
    if (!validation.success) {
      return NextResponse.json(
        { success: false, error: validation.error.errors[0]?.message },
        { status: 400 }
      );
    }

    const {
      providerId,
      title,
      description,
      division,
      district,
      area,
      address,
      phone,
      preferredDate,
      preferredTime,
      estimatedBudget,
    } = validation.data;

    await connectDB();

    const provider = await Provider.findById(providerId);
    if (!provider) {
      return NextResponse.json({ success: false, error: "Selected provider was not found" }, { status: 404 });
    }

    // Customer cannot request service from their own provider profile
    if (provider.user.toString() === session.userId) {
      return NextResponse.json(
        { success: false, error: "You cannot request a service from your own provider profile." },
        { status: 400 }
      );
    }

    const newRequest = await ServiceRequest.create({
      user: session.userId,
      provider: provider._id,
      category: provider.category,
      title,
      description,
      division,
      district,
      area: area || "",
      address,
      phone,
      preferredDate: new Date(preferredDate),
      preferredTime,
      estimatedBudget: estimatedBudget || provider.priceRangeMin || 0,
      status: "pending",
      hasReview: false,
    });

    return NextResponse.json(
      {
        success: true,
        request: newRequest,
        message: "Service request created successfully!",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Create Service Request Error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create service request" },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import { ServiceRequest, Message, User, Provider } from "@/models";
import { getCurrentUser } from "@/lib/auth";
import { sanitizeInput } from "@/lib/security";

export async function GET(
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

    const request = await ServiceRequest.findById(id)
      .populate("user", "name email phone avatar")
      .populate({
        path: "provider",
        select: "businessTitle phone user",
        populate: { path: "user", select: "name avatar email" },
      })
      .lean();

    if (!request) {
      return NextResponse.json({ success: false, error: "Service request not found" }, { status: 404 });
    }

    // Authorization check
    const isCustomer = (request.user as any)?._id?.toString() === session.userId;
    const isProvider =
      (request.provider as any)?.user?._id?.toString() === session.userId ||
      (request.provider as any)?._id?.toString() === session.userId;
    const isAdmin = session.role === "admin";

    if (!isCustomer && !isProvider && !isAdmin) {
      return NextResponse.json(
        { success: false, error: "Forbidden: You are not authorized to view messages for this request." },
        { status: 403 }
      );
    }

    // Fetch messages
    const messages = await Message.find({ serviceRequest: id })
      .sort({ createdAt: 1 })
      .lean();

    return NextResponse.json({
      success: true,
      messages,
      requestInfo: {
        _id: request._id,
        title: request.title,
        status: request.status,
        customer: {
          _id: (request.user as any)?._id,
          name: (request.user as any)?.name || "Customer",
          phone: (request.user as any)?.phone || "",
          avatar: (request.user as any)?.avatar || "",
        },
        provider: {
          _id: (request.provider as any)?._id,
          businessTitle: (request.provider as any)?.businessTitle || "Provider",
          name: (request.provider as any)?.user?.name || "Provider",
          phone: (request.provider as any)?.phone || "",
          avatar: (request.provider as any)?.user?.avatar || "",
        },
      },
    });
  } catch (error) {
    console.error("Fetch Messages Error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch messages" },
      { status: 500 }
    );
  }
}

export async function POST(
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
    const { content } = sanitized;

    if (!content || !content.trim()) {
      return NextResponse.json(
        { success: false, error: "Message content cannot be empty" },
        { status: 400 }
      );
    }

    await connectDB();

    const request = await ServiceRequest.findById(id)
      .populate("user", "name email avatar")
      .populate({
        path: "provider",
        select: "businessTitle user",
        populate: { path: "user", select: "name avatar" },
      });

    if (!request) {
      return NextResponse.json({ success: false, error: "Service request not found" }, { status: 404 });
    }

    const isCustomer = (request.user as any)?._id?.toString() === session.userId;
    const isProvider =
      (request.provider as any)?.user?._id?.toString() === session.userId ||
      (request.provider as any)?._id?.toString() === session.userId;
    const isAdmin = session.role === "admin";

    if (!isCustomer && !isProvider && !isAdmin) {
      return NextResponse.json(
        { success: false, error: "Forbidden: You are not authorized to send messages for this request." },
        { status: 403 }
      );
    }

    const senderRole = isCustomer ? "customer" : isProvider ? "provider" : "admin";

    const createdMessage = await Message.create({
      serviceRequest: id,
      sender: session.userId,
      senderRole,
      senderName: session.name,
      senderAvatar: (session as any).avatar || "",
      content: content.trim(),
      isRead: false,
    });

    const messagePayload = {
      _id: createdMessage._id.toString(),
      serviceRequest: id,
      sender: session.userId,
      senderRole,
      senderName: session.name,
      senderAvatar: (session as any).avatar || "",
      content: content.trim(),
      isRead: false,
      createdAt: createdMessage.createdAt,
    };

    // Forward to Socket server broadcast if active
    try {
      fetch("http://localhost:3001/broadcast", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ requestId: id, message: messagePayload }),
      }).catch(() => {});
    } catch (e) {
      // Non-blocking
    }

    return NextResponse.json({
      success: true,
      message: messagePayload,
    });
  } catch (error) {
    console.error("Send Message Error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to send message" },
      { status: 500 }
    );
  }
}

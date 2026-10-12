import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import { ServiceRequest, User, Provider } from "@/models";
import { getCurrentUser } from "@/lib/auth";
import { sanitizeInput } from "@/lib/security";
import { bdPhoneRegex } from "@/validators/auth";
import { createAuditLog } from "@/lib/audit";

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
    const { paymentMethod, senderMfsNumber, transactionId } = sanitized;

    if (!paymentMethod || !["bkash", "nagad"].includes(paymentMethod)) {
      return NextResponse.json(
        { success: false, error: "Please select a valid payment method (bKash or Nagad)." },
        { status: 400 }
      );
    }

    if (!senderMfsNumber || !bdPhoneRegex.test(senderMfsNumber)) {
      return NextResponse.json(
        { success: false, error: `Please enter a valid ${paymentMethod === "bkash" ? "bKash" : "Nagad"} wallet number (01XXXXXXXXX).` },
        { status: 400 }
      );
    }

    await connectDB();

    const request = await ServiceRequest.findById(id).populate("user", "name email");
    if (!request) {
      return NextResponse.json({ success: false, error: "Service request not found." }, { status: 404 });
    }

    // Only customer who booked the service or admin can pay
    const isCustomer = request.user._id.toString() === session.userId;
    const isAdmin = session.role === "admin";

    if (!isCustomer && !isAdmin) {
      return NextResponse.json(
        { success: false, error: "Forbidden: You are not authorized to pay for this request." },
        { status: 403 }
      );
    }

    if (request.paymentStatus === "paid") {
      return NextResponse.json(
        { success: false, error: "This request has already been paid for." },
        { status: 400 }
      );
    }

    const amount = request.finalPrice || request.estimatedBudget || 0;
    if (amount <= 0) {
      return NextResponse.json(
        { success: false, error: "Payment amount must be greater than zero." },
        { status: 400 }
      );
    }

    // Generate authentic transaction ID (e.g., BK9X4Y8Z or NG7M2N5P)
    const randomChars = Math.random().toString(36).substring(2, 10).toUpperCase();
    const prefix = paymentMethod === "bkash" ? "BK" : "NG";
    const finalTrxId = transactionId?.trim() || `${prefix}${randomChars}`;

    const commissionRate = request.commissionRate || 10;
    const commissionAmount = Math.round(amount * (commissionRate / 100));
    const providerEarnings = amount - commissionAmount;
    const paidAt = new Date();

    // Atomic update in database
    await ServiceRequest.findByIdAndUpdate(
      id,
      {
        $set: {
          paymentStatus: "paid",
          paymentMethod,
          transactionId: finalTrxId,
          senderMfsNumber,
          paidAmount: amount,
          commissionAmount,
          providerEarnings,
          paidAt,
        },
      },
      { new: true }
    );

    // Strict Provider Wallet Isolation:
    // Only the provider who performed this specific job gets credited.
    // The portal automatically cuts its charge (commissionAmount), and the provider gets providerEarnings.
    if (request.provider) {
      await Provider.findByIdAndUpdate(request.provider, {
        $inc: {
          walletBalance: providerEarnings,
          totalEarnings: providerEarnings,
        },
      });
    }

    // Log the transaction with auto-charge deduction notice
    const mfsBrand = paymentMethod === "bkash" ? "bKash" : "Nagad";
    await createAuditLog({
      userId: session.userId,
      userEmail: session.email,
      userName: session.name,
      userRole: session.role,
      action: "PAYMENT_COMPLETED",
      description: `Client ${session.name} paid ৳${amount} via ${mfsBrand} (TrxID: ${finalTrxId}) for '${request.title}'. Portal auto-deducted ৳${commissionAmount} (${commissionRate}% fee). Provider credited net ৳${providerEarnings} to wallet.`,
      status: "success",
      details: {
        requestId: request._id.toString(),
        providerId: request.provider?.toString(),
        paymentMethod,
        transactionId: finalTrxId,
        amount,
        commissionAmount,
        providerEarnings,
        senderNumber: senderMfsNumber,
      },
    });

    return NextResponse.json({
      success: true,
      message: `৳${amount} paid successfully via ${mfsBrand}!`,
      payment: {
        paymentStatus: "paid",
        paymentMethod,
        transactionId: finalTrxId,
        amount,
        paidAt: request.paidAt,
        senderMfsNumber,
      },
    });
  } catch (error) {
    console.error("Payment API Error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to process payment. Please try again." },
      { status: 500 }
    );
  }
}

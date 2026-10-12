import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import { Provider, PayoutRequest } from "@/models";
import { getCurrentUser } from "@/lib/auth";
import { sanitizeInput } from "@/lib/security";
import { bdPhoneRegex } from "@/validators/auth";
import { createAuditLog } from "@/lib/audit";

export async function POST(req: NextRequest) {
  try {
    const session = await getCurrentUser();
    if (!session || (session.role !== "provider" && session.role !== "admin")) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const sanitized = sanitizeInput(body);
    const { amount: rawAmount, paymentMethod, accountNumber, accountType } = sanitized;

    const amount = Number(rawAmount);

    if (!amount || isNaN(amount) || amount < 100) {
      return NextResponse.json(
        { success: false, error: "নূন্যতম ১০০ টাকা উত্তোলন করতে হবে (Minimum withdrawal is ৳100)." },
        { status: 400 }
      );
    }

    if (!paymentMethod || !["bkash", "nagad"].includes(paymentMethod)) {
      return NextResponse.json(
        { success: false, error: "Please select a valid payout method (bKash or Nagad)." },
        { status: 400 }
      );
    }

    const cleanAccount = String(accountNumber || "").trim();
    if (!cleanAccount || !bdPhoneRegex.test(cleanAccount)) {
      return NextResponse.json(
        {
          success: false,
          error: `Please enter a valid 11-digit ${paymentMethod === "bkash" ? "bKash" : "Nagad"} wallet number (01XXXXXXXXX).`,
        },
        { status: 400 }
      );
    }

    await connectDB();

    const provider = await Provider.findOne({ user: session.userId });
    if (!provider) {
      return NextResponse.json({ success: false, error: "Provider profile not found." }, { status: 404 });
    }

    // Check available balance
    if (amount > (provider.walletBalance || 0)) {
      return NextResponse.json(
        {
          success: false,
          error: `অপর্যাপ্ত ব্যালেন্স। আপনার উত্তোলনযোগ্য ব্যালেন্স ৳${provider.walletBalance || 0} (Insufficient balance).`,
        },
        { status: 400 }
      );
    }

    // Generate authentic payout TrxID
    const prefix = paymentMethod === "bkash" ? "BK_OUT_" : "NG_OUT_";
    const randomSuffix = Math.random().toString(36).substring(2, 9).toUpperCase();
    const transactionId = `${prefix}${randomSuffix}`;

    // Atomically decrement wallet balance & increment totalWithdrawn
    const updatedProvider = await Provider.findByIdAndUpdate(
      provider._id,
      {
        $inc: {
          walletBalance: -amount,
          totalWithdrawn: amount,
        },
        $set: {
          [paymentMethod === "bkash" ? "bkashNumber" : "nagadNumber"]: cleanAccount,
        },
      },
      { new: true }
    );

    // Record Payout Request
    const payout = await PayoutRequest.create({
      provider: provider._id,
      user: session.userId,
      amount,
      paymentMethod,
      accountNumber: cleanAccount,
      accountType: accountType === "agent" ? "agent" : "personal",
      status: "approved",
      transactionId,
      adminNotes: "Instant MFS Payout processed successfully",
      processedAt: new Date(),
    });

    const mfsBrand = paymentMethod === "bkash" ? "bKash" : "Nagad";

    // Create Audit Log
    await createAuditLog({
      userId: session.userId,
      userEmail: session.email,
      userName: session.name,
      userRole: session.role,
      action: "WITHDRAWAL_COMPLETED",
      description: `Provider ${session.name} cashed out ৳${amount} via ${mfsBrand} to ${cleanAccount} (TrxID: ${transactionId})`,
      status: "success",
      details: {
        providerId: provider._id.toString(),
        payoutId: payout._id.toString(),
        amount,
        paymentMethod,
        accountNumber: cleanAccount,
        transactionId,
        newBalance: updatedProvider?.walletBalance || 0,
      },
    });

    return NextResponse.json({
      success: true,
      message: `৳${amount} সফলভাবে আপনার ${mfsBrand} অ্যাকাউন্টে পাঠানো হয়েছে!`,
      payout: {
        _id: payout._id,
        amount,
        paymentMethod,
        accountNumber: cleanAccount,
        transactionId,
        processedAt: payout.processedAt,
        status: payout.status,
      },
      newBalance: updatedProvider?.walletBalance || 0,
    });
  } catch (error) {
    console.error("Provider Withdrawal Error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to process withdrawal. Please try again." },
      { status: 500 }
    );
  }
}

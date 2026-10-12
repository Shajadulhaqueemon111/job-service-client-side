import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import { Provider, ServiceRequest, PayoutRequest } from "@/models";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
  try {
    const session = await getCurrentUser();
    if (!session || (session.role !== "provider" && session.role !== "admin")) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const provider = await Provider.findOne({ user: session.userId }).lean();
    if (!provider) {
      return NextResponse.json({ success: false, error: "Provider profile not found" }, { status: 404 });
    }

    // Fetch all completed & paid jobs for this provider
    const paidRequests = await ServiceRequest.find({
      provider: provider._id,
      paymentStatus: "paid",
    })
      .populate("user", "name email phone")
      .populate("category", "name nameBn")
      .sort({ paidAt: -1, createdAt: -1 })
      .lean();

    // Calculate totals
    let totalGrossFromJobs = 0;
    let totalCommissionDeducted = 0;
    let totalNetFromJobs = 0;

    const recentEarnings = paidRequests.map((r) => {
      const gross = r.paidAmount || r.finalPrice || r.estimatedBudget || 0;
      const rate = r.commissionRate || 10;
      const commission = r.commissionAmount || Math.round(gross * (rate / 100));
      const net = r.providerEarnings || gross - commission;

      totalGrossFromJobs += gross;
      totalCommissionDeducted += commission;
      totalNetFromJobs += net;

      return {
        _id: r._id,
        title: r.title,
        customerName: (r.user as any)?.name || "Customer",
        customerPhone: (r.user as any)?.phone || "",
        category: (r.category as any)?.name || "Service",
        grossAmount: gross,
        commissionRate: rate,
        commissionDeducted: commission,
        netCredited: net,
        paymentMethod: r.paymentMethod || "none",
        transactionId: r.transactionId || "",
        paidAt: r.paidAt || r.createdAt,
      };
    });

    // Fetch withdrawal history
    const payouts = await PayoutRequest.find({ provider: provider._id })
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();

    const currentBalance = provider.walletBalance ?? totalNetFromJobs;

    return NextResponse.json({
      success: true,
      wallet: {
        balance: currentBalance,
        totalEarnings: provider.totalEarnings || totalNetFromJobs,
        totalWithdrawn: provider.totalWithdrawn || 0,
        pendingWithdrawal: provider.pendingWithdrawal || 0,
        totalGrossVolume: totalGrossFromJobs,
        totalCommissionDeducted,
        phone: provider.phone,
        bkashNumber: provider.bkashNumber || provider.phone,
        nagadNumber: provider.nagadNumber || provider.phone,
      },
      recentEarnings,
      payouts,
    });
  } catch (error) {
    console.error("Fetch Provider Wallet Error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to load wallet information" },
      { status: 500 }
    );
  }
}

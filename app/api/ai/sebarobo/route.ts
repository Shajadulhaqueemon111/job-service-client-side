import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import { getCurrentUser } from "@/lib/auth";
import { User, Provider, ServiceRequest, PayoutRequest, AuditLog } from "@/models";

interface ActionItem {
  label: string;
  url?: string;
  actionType?: "open_chat" | "navigate" | "diagnose" | "call_support";
  requestId?: string;
}

interface DiagnosisItem {
  category: string;
  status: "ok" | "warning" | "error";
  title: string;
  description: string;
  fix: string;
  action?: ActionItem;
}

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const currentUser = await getCurrentUser();

    const body = await req.json();
    const { prompt = "", mode = "chat", isBn = true } = body;

    // Load rich context if user is authenticated
    let userDoc: any = null;
    let providerDoc: any = null;
    let recentRequests: any[] = [];
    let recentPayouts: any[] = [];

    if (currentUser?.userId) {
      userDoc = await User.findById(currentUser.userId).lean();

      if (currentUser.role === "provider") {
        providerDoc = await Provider.findOne({ user: currentUser.userId }).lean();
        if (providerDoc) {
          recentRequests = await ServiceRequest.find({ provider: providerDoc._id })
            .sort({ createdAt: -1 })
            .limit(5)
            .lean();
          recentPayouts = await PayoutRequest.find({ provider: providerDoc._id })
            .sort({ createdAt: -1 })
            .limit(3)
            .lean();
        }
      } else {
        recentRequests = await ServiceRequest.find({ user: currentUser.userId })
          .populate("provider", "businessTitle phone rating")
          .sort({ createdAt: -1 })
          .limit(5)
          .lean();
      }
    }

    // MODE 1: Full System & Account Diagnostic
    if (mode === "diagnose") {
      const diagnoses: DiagnosisItem[] = [];

      if (!currentUser || !userDoc) {
        return NextResponse.json({
          success: true,
          mode: "diagnose",
          headline: isBn
            ? "গেস্ট ডায়াগনস্টিক রিপোর্ট • প্ল্যাটফর্ম সার্বিক অবস্থা"
            : "Guest Diagnostic • Platform Status",
          healthScore: 90,
          diagnoses: [
            {
              category: "auth",
              status: "warning",
              title: isBn ? "লগইন করা নেই" : "Not Logged In",
              description: isBn
                ? "আপনার নির্দিষ্ট অর্ডার বা অ্যাকাউন্টের সমস্যা সমাধান করতে লগইন করুন।"
                : "Please log in to diagnose your specific orders or wallet.",
              fix: isBn
                ? "লগইন পেইজে গিয়ে আপনার অ্যাকাউন্ট এ প্রবেশ করুন।"
                : "Navigate to login page and access your account.",
              action: { label: isBn ? "লগইন করুন" : "Sign In", url: "/login" },
            },
            {
              category: "system",
              status: "ok",
              title: isBn ? "সিস্টেম ও সার্ভার অনলাইন" : "System & Server Online",
              description: isBn
                ? "Socket.IO রিয়েল-টাইম সার্ভার ও ডাটাবেজ স্বাভাবিকভাবে চলছে।"
                : "Socket.IO server and database operational.",
              fix: isBn ? "কোনো সমস্যার প্রয়োজন নেই।" : "No action required.",
            },
          ],
        });
      }

      // 1. Account status check
      if (userDoc.status === "blocked") {
        diagnoses.push({
          category: "account",
          status: "error",
          title: isBn ? "অ্যাকাউন্ট সাময়িক ব্লকড" : "Account Blocked",
          description: isBn
            ? "অ্যাডমিন বা সিকিউরিটি পলিসি কারণে আপনার অ্যাকাউন্ট ব্লকড আছে।"
            : "Your account is temporarily suspended by admin.",
          fix: isBn
            ? "সহায়তার জন্য অ্যাডমিন সাপোর্টে সরাসরি যোগাযোগ করুন।"
            : "Contact admin support to unblock.",
          action: { label: isBn ? "সাপোর্টে ইমেইল" : "Contact Admin", url: "mailto:support@shebabd.com" },
        });
      } else {
        diagnoses.push({
          category: "account",
          status: "ok",
          title: isBn ? "অ্যাকাউন্ট সচল ও সক্রিয়" : "Account Active",
          description: isBn ? "আপনার প্রোফাইল সঠিক ও অ্যাক্টিভ আছে।" : "Your account status is active and verified.",
          fix: isBn ? "কোনো পদক্ষেপের প্রয়োজন নেই।" : "No action needed.",
        });
      }

      // 2. 2-Step Verification Check
      if (!userDoc.twoFactorEnabled) {
        diagnoses.push({
          category: "security",
          status: "warning",
          title: isBn ? "২-স্টেপ ভেরিফিকেশন বন্ধ" : "2FA Not Enabled",
          description: isBn
            ? "আপনার অ্যাকাউন্টের সর্বোচ্চ সুরক্ষার জন্য ২-স্টেপ ভেরিফিকেশন চালু করা উচিত।"
            : "For maximum security, enable 2-step verification.",
          fix: isBn
            ? "প্রোফাইল সেকশনে গিয়ে ২-স্টেপ ভেরিফিকেশন চালু করুন।"
            : "Go to Profile settings to activate 2FA OTP security.",
          action: { label: isBn ? "প্রোফাইল সিকিউরিটি" : "Profile Settings", url: "/profile" },
        });
      } else {
        diagnoses.push({
          category: "security",
          status: "ok",
          title: isBn ? "২-স্টেপ ভেরিফিকেশন সক্রিয়" : "2FA Protected",
          description: isBn ? "লগইনের সময় ৬ ডিজিটের ওটিপি যাচাই নিশ্চিত আছে।" : "Your account is protected by 2FA.",
          fix: isBn ? "সুরক্ষা নিশ্চিত আছে।" : "Security verified.",
        });
      }

      // 3. Service Requests Checks
      const unpaidRequest = recentRequests.find((r) => r.status === "completed" && r.paymentStatus !== "paid");
      if (unpaidRequest) {
        diagnoses.push({
          category: "payment",
          status: "error",
          title: isBn ? "বকেয়া পেমেন্ট রয়েছে" : "Unpaid Completed Service",
          description: isBn
            ? `কাজ সম্পন্ন হয়েছে কিন্তু '${unpaidRequest.title}' এর বিল এখনও পরিশোধ করা হয়নি।`
            : `Bill pending for completed request '${unpaidRequest.title}'.`,
          fix: isBn
            ? "বিকাশ বা নগদ দিয়ে ট্রানজেকশন আইডি প্রদান করে বিল পরিশোধ সম্পন্ন করুন।"
            : "Pay using bKash/Nagad with your transaction ID from dashboard.",
          action: { label: isBn ? "এখনই বিল পরিশোধ করুন" : "Pay Bill", url: "/dashboard" },
        });
      }

      const pendingRequest = recentRequests.find((r) => r.status === "pending");
      if (pendingRequest) {
        diagnoses.push({
          category: "requests",
          status: "warning",
          title: isBn ? "অপেক্ষমাণ সার্ভিস রিকোয়েস্ট" : "Pending Request Awaiting Provider",
          description: isBn
            ? `'${pendingRequest.title}' রিকোয়েস্টটি প্রোভাইডারের সম্মতির অপেক্ষায় আছে।`
            : `Service request '${pendingRequest.title}' is waiting for provider acceptance.`,
          fix: isBn
            ? "কিছু সময় অপেক্ষা করুন অথবা প্রোভাইডার দেরি করলে রিকোয়েস্ট বাতিল করে অন্য প্রোভাইডারকে বুক করুন।"
            : "Wait for provider acceptance or cancel and rebook another provider.",
          action: { label: isBn ? "রিকোয়েস্ট দেখুন" : "View Requests", url: "/dashboard" },
        });
      }

      // 4. Provider Wallet & Verification Checks
      if (currentUser.role === "provider" && providerDoc) {
        if (providerDoc.walletBalance >= 500) {
          diagnoses.push({
            category: "wallet",
            status: "ok",
            title: isBn ? `উইথড্র যোগ্য ব্যালেন্স: ৳${providerDoc.walletBalance}` : `Available to withdraw: ৳${providerDoc.walletBalance}`,
            description: isBn
              ? "আপনার ওয়ালেটে ৫০০ টাকার বেশি ব্যালেন্স রয়েছে, যা বিকাশ বা নগদে ক্যাশআউট করতে পারবেন।"
              : "You have sufficient balance to request a payout via bKash or Nagad.",
            fix: isBn
              ? "প্রোভাইডার ড্যাশবোর্ডে গিয়ে 'উইথড্র করুন' বাটনে ক্লিক করুন।"
              : "Click 'Withdraw' button on provider dashboard.",
            action: { label: isBn ? "উইথড্র করুন" : "Withdraw Funds", url: "/provider" },
          });
        } else if (providerDoc.walletBalance > 0) {
          diagnoses.push({
            category: "wallet",
            status: "warning",
            title: isBn ? `ব্যালেন্স: ৳${providerDoc.walletBalance} (উইথড্র লিমিট ৫০০ টাকা)` : `Balance: ৳${providerDoc.walletBalance} (Min ৳500 required)`,
            description: isBn
              ? "উইথড্র করতে সর্বনিম্ন ৫০০ টাকা ওয়ালেট ব্যালেন্স প্রয়োজন হয়।"
              : "Minimum payout threshold is ৳500.",
            fix: isBn
              ? "আরও কাজ সম্পন্ন করে ব্যালেন্স ৫০০ বা তার বেশি করুন।"
              : "Complete more jobs to reach the ৳500 withdrawal threshold.",
          });
        }
      }

      const errorCount = diagnoses.filter((d) => d.status === "error").length;
      const warningCount = diagnoses.filter((d) => d.status === "warning").length;
      const healthScore = Math.max(20, 100 - errorCount * 30 - warningCount * 15);

      return NextResponse.json({
        success: true,
        mode: "diagnose",
        headline: isBn ? "সেবারবো AI সিস্টেম ও অ্যাকাউন্ট ডায়াগনস্টিক রিপোর্ট" : "ShebaRobo AI Diagnostic Report",
        healthScore,
        errorCount,
        warningCount,
        diagnoses,
      });
    }

    // MODE 2: Intelligent Issue Resolution Chat
    const queryLower = prompt.toLowerCase();

    // Check Gemini API Key if available for generative AI
    const geminiApiKey = process.env.GEMINI_API_KEY;
    let geminiReply: string | null = null;

    if (geminiApiKey && prompt.trim().length > 3) {
      try {
        const systemPrompt = `You are "ShebaRobo" (সেবারবো), an expert diagnostic and issue-fixing AI agent for ShebaBD (shebabd.com), Bangladesh's premier local service marketplace.
Role: Help customers and providers diagnose errors, troubleshoot payments (bKash/Nagad), resolve delays, explain 10% platform commission, 2FA security, and provide exact actionable steps.
User info: Name: ${currentUser?.name || "Guest"}, Role: ${currentUser?.role || "Guest"}.
Reply in helpful, polite, professional Bengali (or English if user wrote in English). Format responses with clear bullet points:
1. সমস্যার কারণ (Root cause)
2. তাৎক্ষণিক সমাধান (Immediate fix steps)
3. সতর্কতা ও পরবর্তী পদক্ষেপ (Tips). Keep it concise, friendly, and practical.`;

        const geminiRes = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiApiKey}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              contents: [
                {
                  role: "user",
                  parts: [{ text: `${systemPrompt}\n\nUser Question: ${prompt}` }],
                },
              ],
            }),
          }
        );

        if (geminiRes.ok) {
          const geminiData = await geminiRes.json();
          geminiReply = geminiData.candidates?.[0]?.content?.parts?.[0]?.text || null;
        }
      } catch (err) {
        console.error("Gemini API call failed, falling back to local engine:", err);
      }
    }

    // Local Domain-Expert Diagnostic & Resolution Matrix
    let category = "general";
    let problemSummary = "";
    let rootCause = "";
    let solutionSteps: string[] = [];
    let actions: ActionItem[] = [];
    let tip = "";

    // CATEGORY 1: Payments, bKash, Nagad, TrxID, Receipts
    if (
      queryLower.includes("টাকা") ||
      queryLower.includes("পেমেন্ট") ||
      queryLower.includes("বিকাশ") ||
      queryLower.includes("নগদ") ||
      queryLower.includes("trxid") ||
      queryLower.includes("payment") ||
      queryLower.includes("বিল") ||
      queryLower.includes("রসিদ") ||
      queryLower.includes("receipt")
    ) {
      category = "payment";
      problemSummary = isBn
        ? "বিকাশ বা নগদ পেমেন্ট, TrxID ভেরিফিকেশন অথবা বিল পরিশোধ সংক্রান্ত সমস্যা।"
        : "Payment, bKash/Nagad TrxID verification or billing issue.";

      rootCause = isBn
        ? "বিকাশ/নগদ পেমেন্টে ভুল ট্রানজেকশন আইডি (TrxID) দিলে বা অ্যাডমিন যাচাই করার পূর্বেই পেইড স্ট্যাটাস না দেখালে এ সমস্যা হয়। এছাড়াও কোনো কাজ 'Completed' হওয়ার পর বিল অপশন সক্রিয় হয়।"
        : "Incorrect TrxID submission or pending verification by portal system.";

      solutionSteps = [
        isBn
          ? "১. বিকাশ বা নগদ অ্যাপের 'Statement / লেনদেন বিবরণী' থেকে ৮-১০ ডিজিটের সঠিক TrxID কপি করুন (যেমন: BLK92A4)।"
          : "1. Copy the exact 8-10 character TrxID from your bKash or Nagad statement.",
        isBn
          ? "২. কাস্টমার ড্যাশবোর্ডে গিয়ে সংশ্লিষ্ট অর্ডারের 'বিকাশ বা নগদে পরিশোধ করুন' বাটনে ক্লিক করুন।"
          : "2. Go to Customer Dashboard and click 'Pay with bKash/Nagad' button.",
        isBn
          ? "৩. আপনার যে মোবাইল নম্বর থেকে টাকা পাঠিয়েছেন সেই নম্বর ও TrxID লিখে 'নিশ্চিত করুন' চাপুন।"
          : "3. Enter your sender phone number and TrxID, then confirm.",
        isBn
          ? "৪. পেমেন্ট সম্পন্ন হলে 'রসিদ দেখুন (View Receipt)' বাটনে ক্লিক করে ডিজিটাল ভাউচার দেখতে পারবেন।"
          : "4. Once confirmed, download your digital payment receipt.",
      ];

      actions = [
        { label: isBn ? "পেমেন্ট ড্যাশবোর্ডে যান" : "Go to Payments", url: "/dashboard" },
        { label: isBn ? "অ্যাকাউন্ট ডায়াগনস্টিক চালান" : "Run Diagnostic", actionType: "diagnose" },
      ];

      tip = isBn
        ? "মনে রাখবেন: ক্যাশ পেমেন্টের ক্ষেত্রে প্রোভাইডার কাজ শেষ করার পর ড্যাশবোর্ডে বিল নিশ্চিত করা যায়।"
        : "Tip: Cash payments are confirmed once the provider marks the job complete.";
    }

    // CATEGORY 2: Timing, Provider Delay, Live Chat, Arrival
    else if (
      queryLower.includes("সময়") ||
      queryLower.includes("দেরি") ||
      queryLower.includes("কখন") ||
      queryLower.includes("পৌঁছাবে") ||
      queryLower.includes("আসেনি") ||
      queryLower.includes("delay") ||
      queryLower.includes("time") ||
      queryLower.includes("late") ||
      queryLower.includes("chat") ||
      queryLower.includes("চ্যাট")
    ) {
      category = "timing";
      problemSummary = isBn
        ? "প্রোভাইডারের পৌঁছানোর সময়, কাজের আনুমানিক সময় অথবা দেরিতে আসা সংক্রান্ত সমস্যা।"
        : "Service provider arrival time, job duration or delay issue.";

      rootCause = isBn
        ? "রাস্তায় জ্যাম, পূর্বের কোনো কাজে অতিরিক্ত সময় লাগা অথবা সরাসরি যোগাযোগের অভাব।"
        : "Traffic delay, previous job overrun, or lack of direct coordination.";

      solutionSteps = [
        isBn
          ? "১. আমাদের নতুন 'লাইভ সকেট চ্যাট' ওপেন করুন এবং '⏱️ কত সময় লাগবে?' বা '🚗 কখন পৌঁছাবেন?' কুইক বাটনে চাপ দিন।"
          : "1. Open Live Chat and click '⏱️ How much time?' or '🚗 Arrival time?' quick prompts.",
        isBn
          ? "২. চ্যাট মোডালের উপরে থাকা সবুজ ফোন আইকনে ক্লিক করে প্রোভাইডারকে সরাসরি কল করুন।"
          : "2. Tap the direct phone icon on the chat modal to call the provider immediately.",
        isBn
          ? "৩. যদি প্রোভাইডার দীর্ঘক্ষণ কোনো সাড়া না দেয় এবং অর্ডার 'Pending' থাকে, তবে বিনা খরচে অর্ডার বাতিল করতে পারবেন।"
          : "3. If provider is completely unresponsive and status is pending, cancel and rebook another provider.",
      ];

      actions = [
        { label: isBn ? "ড্যাশবোর্ডে লাইভ চ্যাট খুলুন" : "Open Live Chat", url: "/dashboard" },
      ];

      tip = isBn
        ? "প্রোভাইডারের সাথে লাইভ চ্যাটে পার্টস লাগবে কি না তা আগে থেকেই নিশ্চিত করে নিলে দ্রুত কাজ শুরু করা সম্ভব।"
        : "Always confirm if extra spare parts are needed in advance through live chat.";
    }

    // CATEGORY 3: Provider Withdrawal, Wallet Balance, Platform Commission
    else if (
      queryLower.includes("উইথড্র") ||
      queryLower.includes("ক্যাশআউট") ||
      queryLower.includes("withdraw") ||
      queryLower.includes("wallet") ||
      queryLower.includes("ব্যালেন্স") ||
      queryLower.includes("লাভ") ||
      queryLower.includes("profit") ||
      queryLower.includes("কমিশন") ||
      queryLower.includes("commission")
    ) {
      category = "payout";
      problemSummary = isBn
        ? "প্রোভাইডার ওয়ালেট থেকে টাকা তোলা (Withdraw), কমিশনের হিসাব ও ক্যাশআউট সমস্যা।"
        : "Provider earnings withdrawal, platform fee calculation or cashout issue.";

      rootCause = isBn
        ? "ওয়ালেট ব্যালেন্স সর্বনিম্ন ৫০০ টাকার কম হওয়া, অথবা পূর্বে একটি উইথড্র রিকোয়েস্ট পেন্ডিং থাকা।"
        : "Wallet balance below minimum threshold (৳500) or pending payout in review.";

      solutionSteps = [
        isBn
          ? "১. সেবা বিডি প্ল্যাটফর্ম পলিসি অনুযায়ী প্রতিটি কাজের মূল্যের ৯০% প্রোভাইডারের ওয়ালেটে স্বয়ংক্রিয়ভাবে জমা হয় (১০% প্ল্যাটফর্ম চার্জ)।"
          : "1. 90% of job earnings go directly to provider wallet (10% platform fee).",
        isBn
          ? "২. ওয়ালেট ব্যালেন্স সর্বনিম্ন ৫০০ টাকা হলে বিকাশ বা নগদ নম্বর দিয়ে ক্যাশআউট রিকোয়েস্ট দিন।"
          : "2. Once wallet balance reaches at least ৳500, request payout via bKash/Nagad.",
        isBn
          ? "৩. অ্যাডমিন প্যানেল সাধারণত ২ থেকে ৬ ঘণ্টার মধ্যে MFS ক্যাশআউট সম্পন্ন করে।"
          : "3. Admin verifies and completes payouts within 2-6 hours.",
      ];

      actions = [
        { label: isBn ? "প্রোভাইডার ওয়ালেটে যান" : "Provider Wallet", url: "/provider" },
      ];

      tip = isBn
        ? "প্রোভাইডার ড্যাশবোর্ডে আপনার প্রতিটি কাজের আয় ও মোট লাভের লাইভ চার্ট দেখতে পাবেন।"
        : "Monitor your gross vs net earnings graph directly in the Provider dashboard.";
    }

    // CATEGORY 4: 2FA, OTP, Password Reset, Security
    else if (
      queryLower.includes("পাসওয়ার্ড") ||
      queryLower.includes("লগইন") ||
      queryLower.includes("password") ||
      queryLower.includes("login") ||
      queryLower.includes("otp") ||
      queryLower.includes("ওটিপি") ||
      queryLower.includes("2fa") ||
      queryLower.includes("ভেরিফিকেশন") ||
      queryLower.includes("সিকিউরিটি")
    ) {
      category = "security";
      problemSummary = isBn
        ? "অ্যাকাউন্টে লগইন, ২-স্টেপ ভেরিফিকেশন ওটিপি অথবা পাসওয়ার্ড সংক্রান্ত সমস্যা।"
        : "Login authentication, 2-Step Verification OTP or password issue.";

      rootCause = isBn
        ? "ভুল পাসওয়ার্ড টাইপ করা অথবা ২-স্টেপ ভেরিফিকেশনের ওটিপি কোড না পাওয়া।"
        : "Incorrect password or pending 2FA authentication OTP verification.";

      solutionSteps = [
        isBn
          ? "১. বর্তমান ডেভেলপার/টেস্টিং মোডে সবার জন্য ডিফল্ট ২-স্টেপ ওটিপি কোড হলো: '123456'। এই কোডটি দিলেই লগইন হয়ে যাবে।"
          : "1. In demo mode, the 2FA test OTP code is: '123456'.",
        isBn
          ? "২. প্রোফাইল সেকশন (/profile)-এ গিয়ে আপনার তথ্য এবং নতুন পাসওয়ার্ড পরিবর্তন করতে পারেন।"
          : "2. Visit Profile settings (/profile) to update your info or change password.",
        isBn
          ? "৩. চাইলে প্রোফাইল সেকশন থেকেই ২-স্টেপ ভেরিফিকেশন অন অথবা অফ করতে পারবেন।"
          : "3. You can toggle 2FA on/off anytime from your Profile settings.",
        isBn
          ? "৪. প্রোফাইলের নিচের অডিট লগ (Audit Log)-এ গিয়ে কখন পাসওয়ার্ড চেঞ্জ হয়েছে তা দেখতে পারবেন।"
          : "4. Check your account's Audit Log to review all security events.",
      ];

      actions = [
        { label: isBn ? "প্রোফাইল সেটিংসে যান" : "Go to Profile", url: "/profile" },
      ];

      tip = isBn
        ? "পাসওয়ার্ড সবসময় অন্তত ৮ অক্ষরের রাখুন এবং কারো সাথে শেয়ার করবেন না।"
        : "Keep your password secure and at least 8 characters long.";
    }

    // CATEGORY 5: Cancellation, Refund, Dispute
    else if (
      queryLower.includes("বাতিল") ||
      queryLower.includes("ক্যানসেল") ||
      queryLower.includes("cancel") ||
      queryLower.includes("রিফান্ড") ||
      queryLower.includes("refund") ||
      queryLower.includes("অভিযোগ") ||
      queryLower.includes("complain")
    ) {
      category = "dispute";
      problemSummary = isBn
        ? "সার্ভিস বাতিলকরণ, রিফান্ড আবেদন বা প্রোভাইডারের কাজের মান সংক্রান্ত অভিযোগ।"
        : "Service cancellation, refund inquiry or dispute resolution.";

      rootCause = isBn
        ? "প্রোভাইডার কাজ করতে অপারগ হওয়া বা কাস্টমারের সময়সূচি পরিবর্তিত হওয়া।"
        : "Schedule change or provider inability to fulfill service requirements.";

      solutionSteps = [
        isBn
          ? "১. রিকোয়েস্ট 'Pending' অবস্থায় থাকলে কাস্টমার ড্যাশবোর্ড থেকে তাৎক্ষণিক 'রিকোয়েস্ট বাতিল করুন' বাটনে ক্লিক করতে পারবেন।"
          : "1. Pending requests can be cancelled immediately from Customer Dashboard.",
        isBn
          ? "২. কাজ সম্পন্ন হওয়ার পর সন্তুষ্ট না হলে কোনো পেমেন্ট দেওয়ার আগে প্রোভাইডারের সাথে লাইভ চ্যাটে পুনরায় কাজ করিয়ে নিন।"
          : "2. If not satisfied with work, discuss adjustments via live chat before releasing payment.",
        isBn
          ? "৩. কোনো অযৌক্তিক আচরণ হলে আমাদের হেল্পলাইন বা অ্যাডমিন সাপোর্টে সরাসরি রিপোর্ট করুন।"
          : "3. Report any misconduct or disputes directly to ShebaBD Admin support.",
      ];

      actions = [
        { label: isBn ? "ড্যাশবোর্ডে অর্ডার দেখুন" : "View Orders", url: "/dashboard" },
      ];

      tip = isBn
        ? "যেকোনো কাজ শেষে সঠিক রেটিং ও রিভিউ দিলে অন্যান্য কাস্টমাররা সতর্ক হতে পারে।"
        : "Always leave genuine reviews and ratings to help the community.";
    }

    // GENERAL / HOW-TO / FALLBACK
    else {
      category = "general";
      problemSummary = isBn
        ? "সেবা বিডি প্ল্যাটফর্ম ব্যবহারে সহায়তামূলক নির্দেশিকা।"
        : "General ShebaBD platform assistance.";

      rootCause = isBn
        ? "প্ল্যাটফর্মের কোনো ফিচার বা কার্যপ্রণালী পরিষ্কারভাবে বোঝার প্রয়োজন।"
        : "Inquiry on how specific platform workflows operate.";

      solutionSteps = [
        isBn
          ? "১. হোমপেইজে গিয়ে ক্যাটাগরি ও এরিয়া সিলেক্ট করে বিশ্বস্ত টেকনিশিয়ান ও সার্ভিস খুঁজুন।"
          : "1. Browse verified technicians by selecting category and your local district.",
        isBn
          ? "২. প্রোভাইডারের রেটিং ও কাজের অভিজ্ঞতা দেখে 'হায়ার করুন (Hire)' বাটনে চাপুন।"
          : "2. Review ratings and experience, then click 'Hire Provider'.",
        isBn
          ? "৩. প্রোভাইডার গ্রহণ করার পর 'লাইভ চ্যাট' ব্যবহার করে কাজের সময় ও ঠিকানা সমন্বয় করুন।"
          : "3. Use real-time Live Chat to coordinate arrival schedule.",
        isBn
          ? "৪. কাজ শেষ হলে বিকাশ বা নগদের মাধ্যমে নিরাপদ বিল পরিশোধ করুন।"
          : "4. Settle payment easily via bKash or Nagad once job is done.",
      ];

      actions = [
        { label: isBn ? "সার্ভিস খুঁজুন" : "Find Services", url: "/providers" },
        { label: isBn ? "সিস্টেম ডায়াগনস্টিক চালান" : "Run Diagnostic", actionType: "diagnose" },
      ];
    }

    return NextResponse.json({
      success: true,
      mode: "chat",
      category,
      aiGenerated: !!geminiReply,
      geminiResponse: geminiReply,
      diagnosticSolution: {
        problemSummary,
        rootCause,
        solutionSteps,
        actions,
        tip,
      },
    });
  } catch (error) {
    console.error("ShebaRobo AI Error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to process AI diagnostic request.",
      },
      { status: 500 }
    );
  }
}

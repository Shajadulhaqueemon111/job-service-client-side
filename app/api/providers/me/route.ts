import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import { Provider } from "@/models";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
  try {
    const session = await getCurrentUser();
    if (!session || (session.role !== "provider" && session.role !== "admin")) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const provider = await Provider.findOne({ user: session.userId })
      .populate("category", "name nameBn")
      .populate("areas", "areaName areaNameBn")
      .lean();

    if (!provider) {
      return NextResponse.json({ success: false, error: "Provider profile not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, provider });
  } catch (error) {
    console.error("Fetch Provider Me Error:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch provider data" }, { status: 500 });
  }
}

import { NextResponse } from "next/server";
import { getCurrentUser, clearAuthCookies } from "@/lib/auth";
import connectDB from "@/lib/mongodb";
import { User, Provider } from "@/models";

export async function GET() {
  try {
    const session = await getCurrentUser();
    if (!session) {
      return NextResponse.json({ success: false, user: null }, { status: 401 });
    }

    await connectDB();
    const user = await User.findById(session.userId).lean();
    if (!user || user.status === "blocked") {
      const res = NextResponse.json({ success: false, user: null }, { status: 401 });
      clearAuthCookies(res);
      return res;
    }

    let providerId: string | undefined;
    if (user.role === "provider") {
      const providerDoc = await Provider.findOne({ user: user._id }).select("_id").lean();
      if (providerDoc) {
        providerId = providerDoc._id.toString();
      }
    }

    return NextResponse.json({
      success: true,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        status: user.status,
        avatar: user.avatar,
        address: user.address,
        providerId,
        twoFactorEnabled: user.twoFactorEnabled !== false,
      },
    });
  } catch (error) {
    console.error("Auth Me Error:", error);
    return NextResponse.json({ success: false, user: null }, { status: 500 });
  }
}

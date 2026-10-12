import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import { User, Provider } from "@/models";
import { getCurrentUser } from "@/lib/auth";
import { sanitizeInput } from "@/lib/security";
import { bdPhoneRegex } from "@/validators/auth";
import { createAuditLog } from "@/lib/audit";

export async function GET() {
  try {
    const session = await getCurrentUser();
    if (!session) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const user = await User.findById(session.userId).lean();
    if (!user) {
      return NextResponse.json({ success: false, error: "User not found" }, { status: 404 });
    }

    let provider = null;
    if (user.role === "provider") {
      provider = await Provider.findOne({ user: user._id }).lean();
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
        twoFactorEnabled: user.twoFactorEnabled !== false,
      },
      provider,
    });
  } catch (error) {
    console.error("Get Profile Error:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch profile" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await getCurrentUser();
    if (!session) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const ip = req.headers.get("x-forwarded-for") || "local_ip";
    const userAgent = req.headers.get("user-agent") || "";

    const body = await req.json();
    const sanitized = sanitizeInput(body);

    const {
      name,
      phone,
      address,
      avatar,
      // Provider fields
      businessTitle,
      bio,
      category,
      skills,
      hourlyRate,
      priceRangeMin,
      priceRangeMax,
      division,
      district,
      upazila,
      isAvailable,
    } = sanitized;

    if (phone && !bdPhoneRegex.test(phone)) {
      return NextResponse.json(
        { success: false, error: "Please enter a valid Bangladesh phone number (01XXXXXXXXX)" },
        { status: 400 }
      );
    }

    await connectDB();

    const user = await User.findById(session.userId);
    if (!user) {
      return NextResponse.json({ success: false, error: "User not found" }, { status: 404 });
    }

    if (name) user.name = name.trim();
    if (phone) user.phone = phone.trim();
    if (address !== undefined) user.address = address.trim();
    if (avatar !== undefined) user.avatar = avatar.trim();

    await user.save();

    // If provider, update Provider model as well
    let providerDoc = null;
    if (user.role === "provider") {
      providerDoc = await Provider.findOne({ user: user._id });
      if (providerDoc) {
        if (businessTitle !== undefined) providerDoc.businessTitle = businessTitle.trim();
        if (bio !== undefined) providerDoc.bio = bio.trim();
        if (category) providerDoc.category = category;
        if (Array.isArray(skills)) providerDoc.skills = skills;
        if (hourlyRate !== undefined) providerDoc.hourlyRate = Number(hourlyRate) || 0;
        if (priceRangeMin !== undefined) providerDoc.priceRangeMin = Number(priceRangeMin) || 0;
        if (priceRangeMax !== undefined) providerDoc.priceRangeMax = Number(priceRangeMax) || 0;
        if (division) providerDoc.division = division;
        if (district) providerDoc.district = district;
        if (upazila !== undefined) providerDoc.upazila = upazila;
        if (address !== undefined) providerDoc.address = address;
        if (phone !== undefined) providerDoc.phone = phone;
        if (isAvailable !== undefined) providerDoc.isAvailable = Boolean(isAvailable);
        await providerDoc.save();
      }
    }

    // Log the update
    await createAuditLog({
      userId: user._id.toString(),
      userEmail: user.email,
      userName: user.name,
      userRole: user.role,
      action: "PROFILE_UPDATED",
      description: `User ${user.name} updated their profile information`,
      ipAddress: ip,
      userAgent,
      status: "success",
      details: { updatedFields: Object.keys(sanitized) },
    });

    return NextResponse.json({
      success: true,
      message: "Profile updated successfully!",
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        status: user.status,
        avatar: user.avatar,
        address: user.address,
        twoFactorEnabled: user.twoFactorEnabled !== false,
      },
      provider: providerDoc,
    });
  } catch (error) {
    console.error("Update Profile Error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update profile information" },
      { status: 500 }
    );
  }
}

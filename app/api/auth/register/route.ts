import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import { User, Provider, Category } from "@/models";
import { RegisterSchema } from "@/validators/auth";
import { hashPassword, sanitizeInput, checkRateLimit } from "@/lib/security";
import { signAccessToken, signRefreshToken, setAuthCookies } from "@/lib/auth";
import { createAuditLog } from "@/lib/audit";

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get("x-forwarded-for") || "local_ip";
    const rateCheck = checkRateLimit(`register_${ip}`, 10, 60 * 1000);
    if (!rateCheck.allowed) {
      return NextResponse.json(
        { success: false, error: "Too many attempts. Please try again shortly." },
        { status: 429 }
      );
    }

    const body = await req.json();
    const sanitized = sanitizeInput(body);

    const validation = RegisterSchema.safeParse(sanitized);
    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          error: validation.error.errors[0]?.message || "Invalid input data",
        },
        { status: 400 }
      );
    }

    const { name, email, password, phone, role, businessTitle, category, division, district } =
      validation.data;

    await connectDB();

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return NextResponse.json(
        { success: false, error: "An account with this email already exists." },
        { status: 409 }
      );
    }

    const hashedPassword = await hashPassword(password);

    // Create User
    const newUser = await User.create({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      phone,
      role: role || "user",
      status: "active",
      twoFactorEnabled: true,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name)}`,
    });

    let providerDoc = null;
    // If role is provider, initialize provider profile
    if (role === "provider") {
      let categoryId = category;
      if (!categoryId) {
        const defaultCat = await Category.findOne();
        categoryId = defaultCat?._id?.toString() || "";
      }

      if (categoryId) {
        providerDoc = await Provider.create({
          user: newUser._id,
          category: categoryId,
          businessTitle: businessTitle || `${name}'s Professional Services`,
          phone,
          division: division || "Dhaka",
          district: district || "Dhaka",
          skills: [businessTitle || "General Service"],
          experienceYears: 2,
          priceRangeMin: 300,
          priceRangeMax: 2000,
          hourlyRate: 350,
          isVerified: false,
          verificationStatus: "pending",
        });
      }
    }

    // Generate Tokens
    const tokenPayload = {
      userId: newUser._id.toString(),
      email: newUser.email,
      role: newUser.role,
      name: newUser.name,
    };

    const accessToken = signAccessToken(tokenPayload);
    const refreshToken = signRefreshToken(tokenPayload);

    await createAuditLog({
      userId: newUser._id.toString(),
      userEmail: newUser.email,
      userName: newUser.name,
      userRole: newUser.role,
      action: "USER_REGISTERED",
      description: `New ${newUser.role} account registered: ${newUser.name} (${newUser.email})`,
      ipAddress: ip,
      status: "success",
    });

    const res = NextResponse.json({
      success: true,
      user: {
        _id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        phone: newUser.phone,
        role: newUser.role,
        status: newUser.status,
        avatar: newUser.avatar,
        providerId: providerDoc?._id,
      },
      message: "Registration successful!",
    });

    setAuthCookies(res, accessToken, refreshToken);
    return res;
  } catch (error) {
    console.error("Register Error:", error);
    return NextResponse.json(
      { success: false, error: "An error occurred during registration. Please try again." },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import { Category } from "@/models";
import { getCurrentUser } from "@/lib/auth";
import { CategorySchema } from "@/validators/category";
import { sanitizeInput } from "@/lib/security";

export async function GET() {
  try {
    await connectDB();
    const categories = await Category.find({ isActive: true })
      .sort({ order: 1, isPopular: -1, name: 1 })
      .lean();

    return NextResponse.json({
      success: true,
      categories,
    });
  } catch (error) {
    console.error("Fetch Categories Error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch categories" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getCurrentUser();
    if (!session || session.role !== "admin") {
      return NextResponse.json(
        { success: false, error: "Forbidden: Admin access required" },
        { status: 403 }
      );
    }

    const body = await req.json();
    const sanitized = sanitizeInput(body);

    const validation = CategorySchema.safeParse(sanitized);
    if (!validation.success) {
      return NextResponse.json(
        { success: false, error: validation.error.errors[0]?.message },
        { status: 400 }
      );
    }

    const { name, nameBn, icon, description, descriptionBn, image, isPopular, isActive } =
      validation.data;

    await connectDB();

    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

    const newCategory = await Category.create({
      name,
      nameBn,
      slug,
      icon,
      description,
      descriptionBn,
      image,
      isPopular,
      isActive,
    });

    return NextResponse.json(
      { success: true, category: newCategory, message: "Category created successfully" },
      { status: 201 }
    );
  } catch (error) {
    console.error("Create Category Error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create category" },
      { status: 500 }
    );
  }
}

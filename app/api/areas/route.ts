import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import { Area } from "@/models";
import { getCurrentUser } from "@/lib/auth";
import { AreaSchema } from "@/validators/category";
import { sanitizeInput } from "@/lib/security";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const division = searchParams.get("division");
    const district = searchParams.get("district");
    const isPopular = searchParams.get("isPopular");

    await connectDB();

    const query: Record<string, unknown> = {};
    if (division) query.division = new RegExp(`^${division}$`, "i");
    if (district) query.district = new RegExp(`^${district}$`, "i");
    if (isPopular === "true") query.isPopular = true;

    const areas = await Area.find(query).sort({ isPopular: -1, areaName: 1 }).lean();

    return NextResponse.json({
      success: true,
      areas,
    });
  } catch (error) {
    console.error("Fetch Areas Error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch areas" },
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

    const validation = AreaSchema.safeParse(sanitized);
    if (!validation.success) {
      return NextResponse.json(
        { success: false, error: validation.error.errors[0]?.message },
        { status: 400 }
      );
    }

    await connectDB();
    const newArea = await Area.create(validation.data);

    return NextResponse.json(
      { success: true, area: newArea, message: "Area created successfully" },
      { status: 201 }
    );
  } catch (error) {
    console.error("Create Area Error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create area" },
      { status: 500 }
    );
  }
}

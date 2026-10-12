import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import { Provider, Category } from "@/models";
import { FilterQuery } from "mongoose";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search");
    const categoryParam = searchParams.get("category");
    const division = searchParams.get("division");
    const district = searchParams.get("district");
    const area = searchParams.get("area");
    const minRating = searchParams.get("minRating");
    const minPrice = searchParams.get("minPrice");
    const maxPrice = searchParams.get("maxPrice");
    const verifiedOnly = searchParams.get("verifiedOnly");
    const sortBy = searchParams.get("sortBy") || "rating";
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get("limit") || "12", 10)));
    const skip = (page - 1) * limit;

    await connectDB();

    // Query builder
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const query: FilterQuery<any> = {};

    // Only return approved providers or available providers
    query.verificationStatus = { $ne: "rejected" };

    // Category filter (either slug or ObjectId)
    if (categoryParam && categoryParam !== "all") {
      if (categoryParam.match(/^[0-9a-fA-F]{24}$/)) {
        query.category = categoryParam;
      } else {
        const foundCat = await Category.findOne({ slug: categoryParam }).select("_id").lean();
        if (foundCat) {
          query.category = foundCat._id;
        }
      }
    }

    // Geographic filters
    if (division && division !== "all") {
      query.division = new RegExp(`^${division}$`, "i");
    }
    if (district && district !== "all") {
      query.district = new RegExp(`^${district}$`, "i");
    }
    if (area && area !== "all") {
      query.$or = [
        { upazila: new RegExp(`^${area}$`, "i") },
        { address: new RegExp(area, "i") },
      ];
    }

    // Rating filter
    if (minRating) {
      query.rating = { $gte: parseFloat(minRating) };
    }

    // Price range filter
    if (minPrice || maxPrice) {
      query.priceRangeMin = {
        ...(minPrice ? { $gte: parseFloat(minPrice) } : {}),
      };
      if (maxPrice) {
        query.priceRangeMax = { $lte: parseFloat(maxPrice) };
      }
    }

    // Verified only filter
    if (verifiedOnly === "true") {
      query.isVerified = true;
    }

    // Text search on title, skills, bio
    if (search && search.trim()) {
      const searchRegex = new RegExp(search.trim(), "i");
      query.$or = [
        { businessTitle: searchRegex },
        { skills: { $in: [searchRegex] } },
        { bio: searchRegex },
      ];
    }

    // Sorting
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let sortOptions: any = { rating: -1, reviewCount: -1 };
    if (sortBy === "priceAsc") {
      sortOptions = { priceRangeMin: 1 };
    } else if (sortBy === "priceDesc") {
      sortOptions = { priceRangeMax: -1 };
    } else if (sortBy === "jobs") {
      sortOptions = { completedJobsCount: -1 };
    } else if (sortBy === "newest") {
      sortOptions = { createdAt: -1 };
    }

    const [providers, total] = await Promise.all([
      Provider.find(query)
        .select(
          "user category businessTitle bio skills division district upazila experienceYears hourlyRate priceRangeMin priceRangeMax rating reviewCount isVerified verificationStatus galleryImages completedJobsCount isAvailable phone"
        )
        .populate("user", "name email avatar")
        .populate("category", "name nameBn icon slug")
        .populate("areas", "areaName areaNameBn")
        .sort(sortOptions)
        .skip(skip)
        .limit(limit)
        .lean(),
      Provider.countDocuments(query),
    ]);

    return NextResponse.json({
      success: true,
      providers,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Search Providers Error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to search providers" },
      { status: 500 }
    );
  }
}

import mongoose, { Schema, Document, Model } from "mongoose";

export interface IProvider extends Document {
  user: mongoose.Types.ObjectId;
  category: mongoose.Types.ObjectId;
  businessTitle: string;
  bio: string;
  skills: string[];
  areas: mongoose.Types.ObjectId[];
  division: string;
  district: string;
  upazila: string;
  address: string;
  phone: string;
  experienceYears: number;
  hourlyRate: number;
  priceRangeMin: number;
  priceRangeMax: number;
  rating: number;
  reviewCount: number;
  isVerified: boolean;
  verificationStatus: "pending" | "approved" | "rejected";
  galleryImages: string[];
  completedJobsCount: number;
  isAvailable: boolean;
  walletBalance: number;
  totalEarnings: number;
  totalWithdrawn: number;
  pendingWithdrawal: number;
  bkashNumber?: string;
  nagadNumber?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ProviderSchema = new Schema<IProvider>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
      index: true,
    },
    category: {
      type: Schema.Types.ObjectId,
      ref: "Category",
      required: true,
      index: true,
    },
    businessTitle: {
      type: String,
      required: true,
      trim: true,
      maxlength: 150,
    },
    bio: {
      type: String,
      default: "",
      maxlength: 2000,
    },
    skills: {
      type: [String],
      default: [],
      index: true,
    },
    areas: [
      {
        type: Schema.Types.ObjectId,
        ref: "Area",
        index: true,
      },
    ],
    division: {
      type: String,
      required: true,
      index: true,
    },
    district: {
      type: String,
      required: true,
      index: true,
    },
    upazila: {
      type: String,
      default: "",
    },
    address: {
      type: String,
      default: "",
    },
    phone: {
      type: String,
      required: true,
    },
    experienceYears: {
      type: Number,
      default: 1,
      min: 0,
    },
    hourlyRate: {
      type: Number,
      default: 0,
      min: 0,
    },
    priceRangeMin: {
      type: Number,
      default: 300,
      min: 0,
    },
    priceRangeMax: {
      type: Number,
      default: 2000,
      min: 0,
    },
    rating: {
      type: Number,
      default: 5.0,
      min: 0,
      max: 5,
      index: true,
    },
    reviewCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    isVerified: {
      type: Boolean,
      default: false,
      index: true,
    },
    verificationStatus: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
      index: true,
    },
    galleryImages: {
      type: [String],
      default: [],
    },
    completedJobsCount: {
      type: Number,
      default: 0,
      min: 0,
      index: true,
    },
    isAvailable: {
      type: Boolean,
      default: true,
      index: true,
    },
    walletBalance: {
      type: Number,
      default: 0,
      min: 0,
    },
    totalEarnings: {
      type: Number,
      default: 0,
      min: 0,
    },
    totalWithdrawn: {
      type: Number,
      default: 0,
      min: 0,
    },
    pendingWithdrawal: {
      type: Number,
      default: 0,
      min: 0,
    },
    bkashNumber: {
      type: String,
      default: "",
      trim: true,
    },
    nagadNumber: {
      type: String,
      default: "",
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// Prevent cached schema issues in Next.js HMR
if (process.env.NODE_ENV !== "production") {
  delete (mongoose.models as any).Provider;
}

// Compound indexes for fast multi-filter search queries
ProviderSchema.index({ category: 1, isVerified: 1, rating: -1 });
ProviderSchema.index({ division: 1, district: 1, rating: -1 });
ProviderSchema.index({ priceRangeMin: 1, priceRangeMax: 1 });

// Full-text search index on businessTitle and skills
ProviderSchema.index(
  {
    businessTitle: "text",
    skills: "text",
    bio: "text",
  },
  {
    weights: {
      businessTitle: 10,
      skills: 5,
      bio: 1,
    },
    name: "ProviderTextIndex",
  }
);

export const Provider: Model<IProvider> =
  mongoose.models.Provider || mongoose.model<IProvider>("Provider", ProviderSchema);

export default Provider;

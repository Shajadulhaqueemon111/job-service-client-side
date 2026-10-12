import mongoose, { Schema, Document, Model } from "mongoose";

export type RequestStatus = "pending" | "accepted" | "completed" | "rejected" | "cancelled";

export interface IServiceRequest extends Document {
  user: mongoose.Types.ObjectId;
  provider: mongoose.Types.ObjectId;
  category?: mongoose.Types.ObjectId;
  title: string;
  description: string;
  division: string;
  district: string;
  area: string;
  address: string;
  phone: string;
  preferredDate: Date;
  preferredTime: string;
  estimatedBudget?: number;
  finalPrice?: number;
  commissionRate?: number;
  commissionAmount?: number;
  providerEarnings?: number;
  paymentStatus?: "pending" | "paid" | "settled";
  paymentMethod?: "bkash" | "nagad" | "cash" | "none";
  transactionId?: string;
  senderMfsNumber?: string;
  paidAmount?: number;
  paidAt?: Date;
  status: RequestStatus;
  cancellationReason?: string;
  providerNotes?: string;
  hasReview: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ServiceRequestSchema = new Schema<IServiceRequest>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    provider: {
      type: Schema.Types.ObjectId,
      ref: "Provider",
      required: true,
      index: true,
    },
    category: {
      type: Schema.Types.ObjectId,
      ref: "Category",
    },
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },
    description: {
      type: String,
      required: true,
      trim: true,
      maxlength: 3000,
    },
    division: {
      type: String,
      required: true,
    },
    district: {
      type: String,
      required: true,
    },
    area: {
      type: String,
      default: "",
    },
    address: {
      type: String,
      required: true,
      trim: true,
    },
    phone: {
      type: String,
      required: true,
    },
    preferredDate: {
      type: Date,
      required: true,
    },
    preferredTime: {
      type: String,
      required: true,
    },
    estimatedBudget: {
      type: Number,
      default: 0,
    },
    finalPrice: {
      type: Number,
      default: 0,
    },
    commissionRate: {
      type: Number,
      default: 10,
    },
    commissionAmount: {
      type: Number,
      default: 0,
    },
    providerEarnings: {
      type: Number,
      default: 0,
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "settled"],
      default: "pending",
      index: true,
    },
    paymentMethod: {
      type: String,
      enum: ["bkash", "nagad", "cash", "none"],
      default: "none",
    },
    transactionId: {
      type: String,
      default: "",
      trim: true,
    },
    senderMfsNumber: {
      type: String,
      default: "",
      trim: true,
    },
    paidAmount: {
      type: Number,
      default: 0,
    },
    paidAt: {
      type: Date,
    },
    status: {
      type: String,
      enum: ["pending", "accepted", "completed", "rejected", "cancelled"],
      default: "pending",
      index: true,
    },
    cancellationReason: {
      type: String,
      default: "",
    },
    providerNotes: {
      type: String,
      default: "",
    },
    hasReview: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

ServiceRequestSchema.index({ user: 1, createdAt: -1 });
ServiceRequestSchema.index({ provider: 1, status: 1 });

// Prevent cached schema issues in Next.js HMR
if (process.env.NODE_ENV !== "production") {
  delete (mongoose.models as any).ServiceRequest;
}

export const ServiceRequest: Model<IServiceRequest> =
  mongoose.models.ServiceRequest ||
  mongoose.model<IServiceRequest>("ServiceRequest", ServiceRequestSchema);

export default ServiceRequest;

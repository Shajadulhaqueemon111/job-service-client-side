import mongoose, { Schema, Document, Model } from "mongoose";

export interface IPayoutRequest extends Document {
  provider: mongoose.Types.ObjectId;
  user: mongoose.Types.ObjectId;
  amount: number;
  paymentMethod: "bkash" | "nagad";
  accountNumber: string;
  accountType: "personal" | "agent";
  status: "pending" | "approved" | "rejected";
  transactionId: string;
  adminNotes?: string;
  processedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const PayoutRequestSchema = new Schema<IPayoutRequest>(
  {
    provider: {
      type: Schema.Types.ObjectId,
      ref: "Provider",
      required: true,
      index: true,
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 100,
    },
    paymentMethod: {
      type: String,
      enum: ["bkash", "nagad"],
      required: true,
      index: true,
    },
    accountNumber: {
      type: String,
      required: true,
      trim: true,
    },
    accountType: {
      type: String,
      enum: ["personal", "agent"],
      default: "personal",
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "approved",
      index: true,
    },
    transactionId: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    adminNotes: {
      type: String,
      default: "",
    },
    processedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

PayoutRequestSchema.index({ provider: 1, createdAt: -1 });

if (process.env.NODE_ENV !== "production") {
  delete (mongoose.models as any).PayoutRequest;
}

export const PayoutRequest: Model<IPayoutRequest> =
  mongoose.models.PayoutRequest ||
  mongoose.model<IPayoutRequest>("PayoutRequest", PayoutRequestSchema);

export default PayoutRequest;

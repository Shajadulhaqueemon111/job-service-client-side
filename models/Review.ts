import mongoose, { Schema, Document, Model } from "mongoose";

export interface IReview extends Document {
  user: mongoose.Types.ObjectId;
  provider: mongoose.Types.ObjectId;
  serviceRequest: mongoose.Types.ObjectId;
  rating: number;
  comment: string;
  providerResponse?: string;
  isFlagged: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ReviewSchema = new Schema<IReview>(
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
    serviceRequest: {
      type: Schema.Types.ObjectId,
      ref: "ServiceRequest",
      required: true,
      index: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    comment: {
      type: String,
      required: true,
      trim: true,
      maxlength: 1500,
    },
    providerResponse: {
      type: String,
      default: "",
      maxlength: 1500,
    },
    isFlagged: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Ensure one review per service request by a user
ReviewSchema.index({ serviceRequest: 1, user: 1 }, { unique: true });
ReviewSchema.index({ provider: 1, createdAt: -1 });

export const Review: Model<IReview> =
  mongoose.models.Review || mongoose.model<IReview>("Review", ReviewSchema);

export default Review;

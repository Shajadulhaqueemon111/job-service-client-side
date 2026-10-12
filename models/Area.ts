import mongoose, { Schema, Document, Model } from "mongoose";

export interface IArea extends Document {
  division: string;
  divisionBn: string;
  district: string;
  districtBn: string;
  upazila: string;
  upazilaBn: string;
  areaName: string;
  areaNameBn: string;
  isPopular: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const AreaSchema = new Schema<IArea>(
  {
    division: {
      type: String,
      required: true,
      index: true,
    },
    divisionBn: {
      type: String,
      required: true,
    },
    district: {
      type: String,
      required: true,
      index: true,
    },
    districtBn: {
      type: String,
      required: true,
    },
    upazila: {
      type: String,
      required: true,
    },
    upazilaBn: {
      type: String,
      required: true,
    },
    areaName: {
      type: String,
      required: true,
      index: true,
    },
    areaNameBn: {
      type: String,
      required: true,
    },
    isPopular: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for unique area within a district
AreaSchema.index({ district: 1, areaName: 1 }, { unique: true });

export const Area: Model<IArea> =
  mongoose.models.Area || mongoose.model<IArea>("Area", AreaSchema);

export default Area;

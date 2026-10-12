import mongoose, { Schema, Document, Model } from "mongoose";

export interface ICategory extends Document {
  name: string;
  nameBn: string;
  slug: string;
  icon: string;
  description: string;
  descriptionBn: string;
  image?: string;
  isPopular: boolean;
  isActive: boolean;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

const CategorySchema = new Schema<ICategory>(
  {
    name: {
      type: String,
      required: [true, "Category name is required"],
      trim: true,
      unique: true,
    },
    nameBn: {
      type: String,
      required: [true, "Bengali category name is required"],
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      index: true,
    },
    icon: {
      type: String,
      default: "Wrench",
    },
    description: {
      type: String,
      default: "",
    },
    descriptionBn: {
      type: String,
      default: "",
    },
    image: {
      type: String,
      default: "",
    },
    isPopular: {
      type: Boolean,
      default: false,
      index: true,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    order: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

export const Category: Model<ICategory> =
  mongoose.models.Category || mongoose.model<ICategory>("Category", CategorySchema);

export default Category;

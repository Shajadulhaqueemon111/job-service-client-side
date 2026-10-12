import mongoose, { Schema, Document, Model } from "mongoose";

export interface IUser extends Document {
  name: string;
  email: string;
  password?: string;
  phone: string;
  role: "user" | "provider" | "admin";
  status: "active" | "blocked";
  avatar?: string;
  address?: string;
  failedLoginAttempts: number;
  lockUntil?: Date | null;
  twoFactorEnabled: boolean;
  twoFactorCode?: string | null;
  twoFactorExpires?: Date | null;
  twoFactorAttempts?: number;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      maxlength: 100,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      select: false, // Never return password hashes in queries
    },
    phone: {
      type: String,
      required: [true, "Phone number is required"],
      trim: true,
    },
    role: {
      type: String,
      enum: ["user", "provider", "admin"],
      default: "user",
      index: true,
    },
    status: {
      type: String,
      enum: ["active", "blocked"],
      default: "active",
      index: true,
    },
    avatar: {
      type: String,
      default: "",
    },
    address: {
      type: String,
      default: "",
    },
    failedLoginAttempts: {
      type: Number,
      default: 0,
    },
    lockUntil: {
      type: Date,
      default: null,
    },
    twoFactorEnabled: {
      type: Boolean,
      default: true,
      index: true,
    },
    twoFactorCode: {
      type: String,
      select: false,
      default: null,
    },
    twoFactorExpires: {
      type: Date,
      select: false,
      default: null,
    },
    twoFactorAttempts: {
      type: Number,
      select: false,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Prevent re-compilation in development
export const User: Model<IUser> =
  mongoose.models.User || mongoose.model<IUser>("User", UserSchema);

export default User;

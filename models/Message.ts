import mongoose, { Schema, Document, Model } from "mongoose";

export interface IMessage extends Document {
  serviceRequest: mongoose.Types.ObjectId;
  sender: mongoose.Types.ObjectId;
  senderRole: "customer" | "provider" | "admin";
  senderName: string;
  senderAvatar?: string;
  content: string;
  isRead: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const MessageSchema = new Schema<IMessage>(
  {
    serviceRequest: {
      type: Schema.Types.ObjectId,
      ref: "ServiceRequest",
      required: true,
      index: true,
    },
    sender: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    senderRole: {
      type: String,
      enum: ["customer", "provider", "admin"],
      required: true,
    },
    senderName: {
      type: String,
      required: true,
      trim: true,
    },
    senderAvatar: {
      type: String,
      default: "",
    },
    content: {
      type: String,
      required: true,
      trim: true,
      maxlength: 3000,
    },
    isRead: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

MessageSchema.index({ serviceRequest: 1, createdAt: 1 });

if (process.env.NODE_ENV !== "production") {
  delete (mongoose.models as any).Message;
}

export const Message: Model<IMessage> =
  mongoose.models.Message || mongoose.model<IMessage>("Message", MessageSchema);

export default Message;

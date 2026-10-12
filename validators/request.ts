import { z } from "zod";
import { bdPhoneRegex } from "./auth";

export const CreateServiceRequestSchema = z.object({
  providerId: z.string().min(1, "Provider ID is required"),
  title: z.string().min(5, "Title must be at least 5 characters").max(200),
  description: z.string().min(10, "Description must be at least 10 characters").max(3000),
  division: z.string().min(1, "Division is required"),
  district: z.string().min(1, "District is required"),
  area: z.string().optional(),
  address: z.string().min(5, "Street/Home address is required"),
  phone: z.string().regex(bdPhoneRegex, "Enter valid BD phone number (01XXXXXXXXX)"),
  preferredDate: z.string().min(1, "Preferred date is required"),
  preferredTime: z.string().min(1, "Preferred time is required"),
  estimatedBudget: z.coerce.number().min(0).optional(),
});

export const UpdateRequestStatusSchema = z.object({
  status: z.enum(["accepted", "completed", "rejected", "cancelled"]),
  cancellationReason: z.string().optional(),
  providerNotes: z.string().optional(),
  finalPrice: z.coerce.number().min(0).optional(),
});

import { z } from "zod";

export const CreateReviewSchema = z.object({
  serviceRequestId: z.string().min(1, "Service Request ID is required"),
  rating: z.coerce.number().min(1).max(5),
  comment: z.string().min(5, "Review comment must be at least 5 characters").max(1500),
});

export const ProviderReplySchema = z.object({
  response: z.string().min(2, "Response cannot be empty").max(1500),
});

export const CreateReportSchema = z.object({
  targetType: z.enum(["provider", "user", "review"]),
  targetId: z.string().min(1, "Target ID is required"),
  reason: z.string().min(5, "Reason is required"),
  details: z.string().max(2000).optional(),
});

import { z } from "zod";
import { bdPhoneRegex } from "./auth";

export const ProviderProfileSchema = z.object({
  businessTitle: z.string().min(3, "Title must be at least 3 characters").max(150),
  category: z.string().min(1, "Category is required"),
  bio: z.string().max(2000).optional(),
  skills: z.array(z.string()).min(1, "Add at least one skill or specialty"),
  areas: z.array(z.string()).optional(),
  division: z.string().min(1, "Division is required"),
  district: z.string().min(1, "District is required"),
  upazila: z.string().optional(),
  address: z.string().max(300).optional(),
  phone: z.string().regex(bdPhoneRegex, "Enter valid BD phone number (01XXXXXXXXX)"),
  experienceYears: z.coerce.number().min(0).max(50),
  hourlyRate: z.coerce.number().min(0),
  priceRangeMin: z.coerce.number().min(0),
  priceRangeMax: z.coerce.number().min(0),
  galleryImages: z.array(z.string()).optional(),
  isAvailable: z.boolean().optional(),
});

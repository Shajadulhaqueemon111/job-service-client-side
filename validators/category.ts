import { z } from "zod";

export const CategorySchema = z.object({
  name: z.string().min(2, "Name is required").max(100),
  nameBn: z.string().min(2, "Bengali name is required").max(100),
  icon: z.string().default("Wrench"),
  description: z.string().max(500).optional(),
  descriptionBn: z.string().max(500).optional(),
  image: z.string().optional(),
  isPopular: z.boolean().default(false),
  isActive: z.boolean().default(true),
});

export const AreaSchema = z.object({
  division: z.string().min(1, "Division is required"),
  divisionBn: z.string().min(1, "Bengali division is required"),
  district: z.string().min(1, "District is required"),
  districtBn: z.string().min(1, "Bengali district is required"),
  upazila: z.string().min(1, "Upazila is required"),
  upazilaBn: z.string().min(1, "Bengali upazila is required"),
  areaName: z.string().min(1, "Area name is required"),
  areaNameBn: z.string().min(1, "Bengali area name is required"),
  isPopular: z.boolean().default(false),
});

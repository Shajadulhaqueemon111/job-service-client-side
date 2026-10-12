import { z } from "zod";

// Bangladesh Phone Validation: matches 013XXXXXXXX, 014XXXXXXXX, 015XXXXXXXX, 016XXXXXXXX, 017XXXXXXXX, 018XXXXXXXX, 019XXXXXXXX
export const bdPhoneRegex = /^(?:\+88)?(01[3-9]\d{8})$/;

export const RegisterSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(100),
  email: z.string().email("Invalid email address"),
  password: z
    .string()
    .min(6, "Password must be at least 6 characters")
    .max(100),
  phone: z
    .string()
    .regex(bdPhoneRegex, "Please enter a valid Bangladesh phone number (01XXXXXXXXX)"),
  role: z.enum(["user", "provider"]).default("user"),
  // Optional provider fields during registration
  businessTitle: z.string().optional(),
  category: z.string().optional(),
  division: z.string().optional(),
  district: z.string().optional(),
});

export const LoginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export const UpdateProfileSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  phone: z.string().regex(bdPhoneRegex, "Invalid Bangladesh phone number").optional(),
  address: z.string().max(300).optional(),
  avatar: z.string().optional(),
});

export const ChangePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z.string().min(6, "New password must be at least 6 characters"),
});

import connectDB from "@/lib/mongodb";
import { AuditLog } from "@/models";

export interface LogAuditParams {
  userId?: string;
  userEmail: string;
  userName?: string;
  userRole?: "user" | "provider" | "admin" | "anonymous";
  action: string;
  description: string;
  ipAddress?: string;
  userAgent?: string;
  status?: "success" | "failure" | "warning";
  details?: Record<string, unknown>;
}

export async function createAuditLog(params: LogAuditParams): Promise<void> {
  try {
    await connectDB();
    await AuditLog.create({
      userId: params.userId || undefined,
      userEmail: params.userEmail,
      userName: params.userName || "User",
      userRole: params.userRole || "anonymous",
      action: params.action,
      description: params.description,
      ipAddress: params.ipAddress || "",
      userAgent: params.userAgent || "",
      status: params.status || "success",
      details: params.details || {},
    });
  } catch (error) {
    console.error("Audit log creation error (non-fatal):", error);
  }
}

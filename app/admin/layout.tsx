"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { CircleDollarSign, ShieldCheck, Sparkles } from "lucide-react";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/dashboard-01/app-sidebar";
import { SiteHeader } from "@/components/dashboard-01/site-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const getHeaderInfo = () => {
    if (pathname.startsWith("/admin/revenue")) {
      return {
        title: "Platform Revenue & Profit Accounting",
        subtitle: "10% platform commission accounting, gross volume & payout records",
      };
    }
    if (pathname.startsWith("/admin/providers")) {
      return {
        title: "Provider Verification & Management",
        subtitle: "Verify service provider documents, credentials, and accounts",
      };
    }
    if (pathname.startsWith("/admin/users")) {
      return {
        title: "User Account Moderation",
        subtitle: "Manage customers, providers, and account security statuses",
      };
    }
    if (pathname.startsWith("/admin/categories")) {
      return {
        title: "Categories Management",
        subtitle: "Manage dual-language service categories and hierarchy",
      };
    }
    if (pathname.startsWith("/admin/audit-logs")) {
      return {
        title: "System Security & Audit Logs",
        subtitle: "Real-time audit trail of logins, financial transactions, and actions",
      };
    }
    if (pathname.startsWith("/admin/reports")) {
      return {
        title: "Trust, Safety & Moderation Reports",
        subtitle: "Review complaints and moderation tickets",
      };
    }
    return {
      title: "Admin Overview & Analytics",
      subtitle: "Real-time platform metrics, revenue tracking, and order fulfillment",
    };
  };

  const headerInfo = getHeaderInfo();

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        {/* Sticky Header with Actions */}
        <SiteHeader
          title={headerInfo.title}
          subtitle={headerInfo.subtitle}
          badge={
            <Badge
              variant="outline"
              className="border-emerald-500/30 text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 text-[10px] font-bold"
            >
              <Sparkles className="h-3 w-3 mr-1" />
              Live Platform
            </Badge>
          }
          actions={
            <div className="flex items-center gap-2">
              <Link href="/admin/revenue">
                <Button size="sm" variant="gradient" className="font-bold gap-1.5 text-xs rounded-xl shadow-xs h-8">
                  <CircleDollarSign className="h-3.5 w-3.5" />
                  <span className="hidden md:inline">Revenue & Profit</span>
                </Button>
              </Link>
              <Link href="/admin/providers">
                <Button size="sm" className="bg-rose-600 hover:bg-rose-700 text-white font-bold gap-1.5 text-xs rounded-xl shadow-xs h-8">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  <span className="hidden md:inline">Verify Providers</span>
                </Button>
              </Link>
            </div>
          }
        />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto w-full space-y-6">
            {children}
          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}

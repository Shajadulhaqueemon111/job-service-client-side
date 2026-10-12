"use client";

import React from "react";
import Link from "next/link";
import { PlusCircle, Sparkles } from "lucide-react";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/dashboard-01/app-sidebar";
import { SiteHeader } from "@/components/dashboard-01/site-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default function CustomerDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <SiteHeader
          title="Customer Dashboard"
          subtitle="Track your bookings, technician assignments, and payments"
          badge={
            <Badge
              variant="outline"
              className="border-emerald-500/30 text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 text-[10px] font-bold"
            >
              <Sparkles className="h-3 w-3 mr-1" />
              My Orders
            </Badge>
          }
          actions={
            <div className="flex items-center gap-2">
              <Link href="/services">
                <Button size="sm" variant="gradient" className="font-bold gap-1.5 text-xs rounded-xl shadow-xs h-8">
                  <PlusCircle className="h-3.5 w-3.5" />
                  <span className="hidden md:inline">Book Service</span>
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

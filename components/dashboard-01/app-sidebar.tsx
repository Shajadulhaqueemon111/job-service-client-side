"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Search,
  Users,
  FolderTree,
  User,
  Home,
  LogOut,
  Sun,
  Moon,
  PlusCircle,
  MoreHorizontal,
  Wrench,
  ShieldCheck,
  Wallet,
  Briefcase,
  Star,
  FileText,
  BarChart2,
  CircleDollarSign,
  AlertTriangle,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/lib/auth-context";
import { useTheme } from "@/components/theme-provider";
import { useI18n } from "@/lib/i18n/context";

export function AppSidebar() {
  const { user, logout } = useAuth();
  const { isDark, setTheme } = useTheme();
  const { isBn } = useI18n();
  const pathname = usePathname();

  const isProviderArea = pathname.startsWith("/provider");
  const isAdminArea = pathname.startsWith("/admin");

  // Real Project Navigation Items depending on role/section
  const customerNav = [
    { title: isBn ? "আমার রিকোয়েস্ট" : "My Requests", url: "/dashboard", icon: LayoutDashboard },
    { title: isBn ? "সকল সার্ভিস" : "Browse Services", url: "/services", icon: Wrench },
    { title: isBn ? "প্রোভাইডার খুঁজুন" : "Find Providers", url: "/providers", icon: Users },
    { title: isBn ? "ক্যাটাগরি" : "Service Categories", url: "/categories", icon: FolderTree },
  ];

  const providerNav = [
    { title: isBn ? "কাজের রিকোয়েস্ট" : "Jobs & Requests", url: "/provider", icon: LayoutDashboard },
    { title: isBn ? "ওয়ালেট ও টাকা উত্তোলন" : "Wallet & Payouts", url: "/provider/wallet", icon: Wallet },
    { title: isBn ? "বিজনেস প্রোফাইল" : "Service Profile", url: "/provider/profile", icon: Briefcase },
    { title: isBn ? "গ্রাহকদের রিভিউ" : "Reviews & Ratings", url: "/provider/reviews", icon: Star },
  ];

  const adminNav = [
    { title: "Overview", url: "/admin", icon: BarChart2 },
    { title: "Revenue & Profit", url: "/admin/revenue", icon: CircleDollarSign },
    { title: "Verify Providers", url: "/admin/providers", icon: ShieldCheck },
    { title: "User Management", url: "/admin/users", icon: Users },
    { title: "Categories", url: "/admin/categories", icon: FolderTree },
    { title: "Audit Logs", url: "/admin/audit-logs", icon: FileText },
    { title: "Reports", url: "/admin/reports", icon: AlertTriangle },
  ];

  const currentNav = isAdminArea ? adminNav : isProviderArea ? providerNav : customerNav;

  return (
    <Sidebar className="border-r border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/95">
      {/* Sidebar Header with ShebaBD Logo */}
      <SidebarHeader className="px-3 pt-3">
        <SidebarMenu>
          <SidebarMenuItem>
            <Link href="/" className="flex items-center gap-2.5 px-1 py-1 rounded-xl group">
              <div className="h-8 w-8 rounded-xl bg-emerald-600 flex items-center justify-center text-white shadow-xs group-hover:scale-105 transition-transform">
                <Wrench className="h-4 w-4" />
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-extrabold tracking-tight text-slate-900 dark:text-white">
                  ShebaBD
                </span>
                <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold tracking-wider uppercase">
                  {isAdminArea ? "Admin Portal" : isProviderArea ? "Provider Hub" : "Customer Portal"}
                </span>
              </div>
            </Link>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent className="px-3">
        {/* Quick Action Button + Theme Toggle Button */}
        <div className="flex items-center gap-2 px-1 mb-2">
          <Link
            href={isProviderArea ? "/provider/wallet" : "/services"}
            className="flex-1 flex items-center justify-center gap-2 h-9 px-3 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-semibold text-xs hover:opacity-90 transition-all shadow-xs cursor-pointer"
          >
            <PlusCircle className="h-3.5 w-3.5" />
            <span>{isProviderArea ? (isBn ? "টাকা তুলুন" : "Cashout") : (isBn ? "নতুন সার্ভিস" : "Book Service")}</span>
          </Link>

          {/* Theme Toggle Button */}
          <button
            type="button"
            onClick={() => setTheme(isDark ? "light" : "dark")}
            title="Toggle Light / Dark mode"
            className="h-9 w-9 flex items-center justify-center rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-800/80 text-slate-700 dark:text-zinc-200 hover:bg-slate-100 dark:hover:bg-zinc-700 transition-colors cursor-pointer shrink-0"
          >
            {isDark ? <Sun className="h-4 w-4 text-amber-400" /> : <Moon className="h-4 w-4 text-slate-700" />}
            <span className="sr-only">Toggle theme</span>
          </button>
        </div>

        {/* Real Main Navigation */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-wider px-2">
            Navigation
          </SidebarGroupLabel>
          <SidebarGroupContent className="mt-1">
            <SidebarMenu>
              {currentNav.map((item) => {
                const isActive = pathname === item.url;
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild isActive={isActive}>
                      <Link href={item.url} className="flex items-center gap-2.5 text-xs">
                        <item.icon className="h-4 w-4 shrink-0 text-slate-500 dark:text-zinc-400" />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Real Quick Links */}
        <SidebarGroup className="mt-2">
          <SidebarGroupLabel className="text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-wider px-2">
            Account & System
          </SidebarGroupLabel>
          <SidebarGroupContent className="mt-1">
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={pathname === "/dashboard/profile"}>
                  <Link href="/dashboard/profile" className="flex items-center gap-2.5 text-xs">
                    <User className="h-4 w-4 shrink-0 text-slate-500 dark:text-zinc-400" />
                    <span>{isBn ? "প্রোফাইল সেটিংস" : "Profile Settings"}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link href="/" className="flex items-center gap-2.5 text-xs">
                    <Home className="h-4 w-4 shrink-0 text-slate-500 dark:text-zinc-400" />
                    <span>{isBn ? "মূল হোমপেজ" : "Public Website"}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* Real User Profile Footer */}
      <SidebarFooter className="p-3 border-t border-slate-200 dark:border-zinc-800">
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  className="flex w-full items-center gap-3 rounded-xl p-2 text-left hover:bg-slate-100 dark:hover:bg-zinc-800/60 transition-colors cursor-pointer"
                >
                  <Avatar
                    src={user?.avatar}
                    fallback={user?.name || "U"}
                    size="sm"
                    className="border border-slate-200 dark:border-zinc-700 rounded-lg shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                      {user?.name || "Guest User"}
                    </p>
                    <p className="text-[10px] text-slate-500 dark:text-zinc-400 truncate">
                      {user?.email || "Signed In"}
                    </p>
                  </div>
                  <MoreHorizontal className="h-4 w-4 text-slate-400 dark:text-zinc-500" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 mb-2 bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-800">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => {}}>
                  <User className="h-4 w-4 mr-2" />
                  <Link href="/dashboard/profile" className="flex-1">Profile</Link>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme(isDark ? "light" : "dark")}>
                  {isDark ? <Sun className="h-4 w-4 mr-2 text-amber-400" /> : <Moon className="h-4 w-4 mr-2" />}
                  <span>Toggle Theme</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => logout()}>
                  <LogOut className="h-4 w-4 mr-2 text-rose-500" />
                  <span className="text-rose-500 font-semibold">Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}

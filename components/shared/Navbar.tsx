"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Wrench,
  Search,
  Globe,
  Sun,
  Moon,
  Menu,
  X,
  User as UserIcon,
  ShieldCheck,
  Briefcase,
  LogOut,
  LayoutDashboard,
} from "lucide-react";
import { useI18n } from "@/lib/i18n/context";
import { useAuth } from "@/lib/auth-context";
import { useTheme } from "@/components/theme-provider";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

export function Navbar() {
  const { t, locale, setLocale, isBn } = useI18n();
  const { user, logout } = useAuth();
  const { theme, setTheme, isDark } = useTheme();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const toggleLanguage = () => {
    setLocale(locale === "en" ? "bn" : "en");
  };

  const toggleTheme = () => {
    setTheme(isDark ? "light" : "dark");
  };

  const getDashboardLink = () => {
    if (!user) return "/dashboard";
    if (user.role === "admin") return "/admin";
    if (user.role === "provider") return "/provider";
    return "/dashboard";
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200/80 dark:border-slate-800/80 bg-white/85 dark:bg-slate-950/85 backdrop-blur-md transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-emerald-600 via-teal-600 to-emerald-500 flex items-center justify-center text-white shadow-md shadow-emerald-600/25 group-hover:scale-105 transition-transform">
              <Wrench className="h-5 w-5 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-xl sm:text-2xl tracking-tight bg-gradient-to-r from-emerald-600 to-teal-700 dark:from-emerald-400 dark:to-teal-300 bg-clip-text text-transparent">
                {t.common.siteName}
              </span>
              <span className="text-[10px] uppercase tracking-wider font-semibold text-slate-500 dark:text-slate-400 -mt-1 hidden sm:block">
                Bangladesh
              </span>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-6 lg:gap-8">
            <Link
              href="/services"
              className={`text-sm font-medium transition-colors hover:text-emerald-600 dark:hover:text-emerald-400 flex items-center gap-1.5 ${
                pathname === "/services"
                  ? "text-emerald-600 dark:text-emerald-400 font-semibold"
                  : "text-slate-700 dark:text-slate-300"
              }`}
            >
              <Search className="h-4 w-4" />
              {isBn ? "সকল সার্ভিস" : "Find Services"}
            </Link>

            <Link
              href="/categories"
              className={`text-sm font-medium transition-colors hover:text-emerald-600 dark:hover:text-emerald-400 ${
                pathname === "/categories"
                  ? "text-emerald-600 dark:text-emerald-400 font-semibold"
                  : "text-slate-700 dark:text-slate-300"
              }`}
            >
              {t.common.allCategories}
            </Link>

            {!user && (
              <Link
                href="/register?role=provider"
                className="text-sm font-medium text-amber-600 dark:text-amber-400 hover:text-amber-700 flex items-center gap-1"
              >
                <Briefcase className="h-4 w-4" />
                {isBn ? "প্রোভাইডার হন" : "Join as Provider"}
              </Link>
            )}
          </nav>

          {/* Actions & Utilities */}
          <div className="hidden sm:flex items-center gap-3">
            {/* Language Switcher */}
            <button
              onClick={toggleLanguage}
              aria-label="Switch Language"
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <Globe className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>{locale === "en" ? "বাংলা" : "English"}</span>
            </button>

            {/* Dark / Light Mode Switcher */}
            <button
              onClick={toggleTheme}
              aria-label="Toggle Theme"
              className="p-2 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              {isDark ? <Sun className="h-4 w-4 text-amber-400" /> : <Moon className="h-4 w-4" />}
            </button>

            {/* User State */}
            {user ? (
              <div className="flex items-center gap-3">
                <Link href={getDashboardLink()} className="flex items-center gap-2 group">
                  <Avatar src={user.avatar} fallback={user.name} size="sm" />
                  <div className="text-left hidden lg:block">
                    <p className="text-xs font-bold text-slate-800 dark:text-slate-200 group-hover:text-emerald-600 line-clamp-1">
                      {user.name}
                    </p>
                    <Badge variant={user.role === "admin" ? "destructive" : user.role === "provider" ? "verified" : "secondary"} className="text-[9px] py-0 px-1.5 uppercase">
                      {user.role}
                    </Badge>
                  </div>
                </Link>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => logout()}
                  className="gap-1.5 text-xs text-rose-600 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/30 border-rose-200 dark:border-rose-900/50"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  <span className="hidden xl:inline">{t.common.logout}</span>
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link href="/login">
                  <Button variant="ghost" size="sm" className="font-semibold text-xs sm:text-sm">
                    {t.common.login}
                  </Button>
                </Link>
                <Link href="/register">
                  <Button size="sm" className="font-semibold text-xs sm:text-sm">
                    {t.common.register}
                  </Button>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex items-center gap-2 md:hidden">
            <button
              onClick={toggleLanguage}
              className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-xs font-bold"
            >
              {locale === "en" ? "বাং" : "EN"}
            </button>
            <button
              onClick={toggleTheme}
              className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300"
            >
              {isDark ? <Sun className="h-4 w-4 text-amber-400" /> : <Moon className="h-4 w-4" />}
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 px-4 pt-2 pb-6 space-y-3">
          <Link
            href="/services"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-2 py-2 text-sm font-medium text-slate-800 dark:text-slate-200"
          >
            <Search className="h-4 w-4 text-emerald-600" />
            {isBn ? "সকল সার্ভিস অনুসন্ধান" : "Find Services"}
          </Link>
          <Link
            href="/categories"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-2 py-2 text-sm font-medium text-slate-800 dark:text-slate-200"
          >
            <Wrench className="h-4 w-4 text-emerald-600" />
            {t.common.allCategories}
          </Link>

          {user ? (
            <div className="pt-3 border-t border-slate-200 dark:border-slate-800 space-y-2">
              <div className="flex items-center gap-3 py-1">
                <Avatar src={user.avatar} fallback={user.name} size="sm" />
                <div>
                  <p className="text-sm font-bold text-slate-900 dark:text-slate-100">{user.name}</p>
                  <p className="text-xs text-slate-500 uppercase">{user.role}</p>
                </div>
              </div>
              <Link
                href={getDashboardLink()}
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2 py-2 text-sm font-medium text-emerald-600"
              >
                <LayoutDashboard className="h-4 w-4" />
                {user.role === "admin" ? t.common.adminPanel : user.role === "provider" ? t.common.providerDashboard : t.common.dashboard}
              </Link>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => {
                  setMobileMenuOpen(false);
                  logout();
                }}
                className="w-full gap-2 mt-2"
              >
                <LogOut className="h-4 w-4" />
                {t.common.logout}
              </Button>
            </div>
          ) : (
            <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex flex-col gap-2">
              <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
                <Button variant="outline" className="w-full justify-center">
                  {t.common.login}
                </Button>
              </Link>
              <Link href="/register" onClick={() => setMobileMenuOpen(false)}>
                <Button className="w-full justify-center">
                  {t.common.register}
                </Button>
              </Link>
              <Link href="/register?role=provider" onClick={() => setMobileMenuOpen(false)}>
                <Button variant="secondary" className="w-full justify-center text-amber-700 dark:text-amber-400">
                  {isBn ? "প্রোভাইডার হিসেবে যোগ দিন" : "Join as Service Provider"}
                </Button>
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
}

"use client";

import * as React from "react";
import Link from "next/link";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { useTheme } from "@/components/theme-provider";
import { Sun, Moon, Home } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SiteHeaderProps {
  title?: string;
  subtitle?: string;
  badge?: React.ReactNode;
  actions?: React.ReactNode;
}

export function SiteHeader({
  title = "Dashboard",
  subtitle,
  badge,
  actions,
}: SiteHeaderProps) {
  const { isDark, setTheme } = useTheme();

  return (
    <header className="sticky top-0 z-40 flex h-16 shrink-0 items-center justify-between border-b border-slate-200 dark:border-zinc-800 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md px-4 sm:px-6 shadow-2xs transition-colors">
      <div className="flex items-center gap-3 min-w-0">
        <SidebarTrigger className="-ml-1 text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white shrink-0" />
        <Separator orientation="vertical" className="h-4 bg-slate-200 dark:bg-zinc-800 shrink-0" />
        <div className="flex flex-col justify-center min-w-0">
          <div className="flex items-center gap-2">
            <h1 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white tracking-tight truncate">
              {title}
            </h1>
            {badge}
          </div>
          {subtitle && (
            <p className="text-[11px] text-slate-500 dark:text-zinc-400 font-medium truncate hidden md:block">
              {subtitle}
            </p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        {actions}

        {/* Public site link */}
        <Link href="/">
          <Button
            variant="ghost"
            size="sm"
            className="text-xs font-semibold gap-1.5 text-slate-600 dark:text-zinc-300 hover:text-slate-900 dark:hover:text-white rounded-xl h-8"
          >
            <Home className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Home</span>
          </Button>
        </Link>

        {/* Theme toggle */}
        <button
          type="button"
          onClick={() => setTheme(isDark ? "light" : "dark")}
          className="h-8 w-8 flex items-center justify-center rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-800/80 text-slate-700 dark:text-zinc-200 hover:bg-slate-100 dark:hover:bg-zinc-700 transition-colors cursor-pointer"
          title="Toggle light/dark theme"
        >
          {isDark ? <Sun className="h-3.5 w-3.5 text-amber-400" /> : <Moon className="h-3.5 w-3.5 text-slate-700" />}
        </button>
      </div>
    </header>
  );
}

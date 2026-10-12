"use client";

import * as React from "react";
import { TrendingDown, TrendingUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

export interface DashboardMetricCard {
  title: string;
  value: string | number;
  badge?: {
    text: string;
    trend?: "up" | "down" | "neutral";
  };
  footer?: {
    trendText?: string;
    trend?: "up" | "down";
    subtext?: string;
  };
}

interface SectionCardsProps {
  cards: DashboardMetricCard[];
  className?: string;
}

export function SectionCards({ cards, className }: SectionCardsProps) {
  return (
    <div className={cn("grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5", className)}>
      {cards.map((card, idx) => (
        <Card
          key={idx}
          className="relative overflow-hidden rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/90 text-slate-900 dark:text-zinc-100 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
        >
          <CardHeader className="p-5 pb-2">
            <div className="flex items-center justify-between">
              <CardDescription className="text-xs font-semibold text-slate-500 dark:text-zinc-400 uppercase tracking-wider">
                {card.title}
              </CardDescription>

              {card.badge && (
                <Badge
                  variant="outline"
                  className={cn(
                    "flex items-center gap-1 rounded-lg px-2 py-0.5 text-[11px] font-bold border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800/60 text-slate-700 dark:text-zinc-300 shadow-2xs",
                    card.badge.trend === "up" && "text-emerald-600 dark:text-emerald-400 border-emerald-500/20 bg-emerald-50 dark:bg-emerald-950/40",
                    card.badge.trend === "down" && "text-rose-600 dark:text-rose-400 border-rose-500/20 bg-rose-50 dark:bg-rose-950/40"
                  )}
                >
                  {card.badge.trend === "up" && <TrendingUp className="h-3 w-3" />}
                  {card.badge.trend === "down" && <TrendingDown className="h-3 w-3" />}
                  <span>{card.badge.text}</span>
                </Badge>
              )}
            </div>

            <CardTitle className="mt-2 text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white tabular-nums">
              {card.value}
            </CardTitle>
          </CardHeader>

          {card.footer && (
            <CardFooter className="flex-col items-start gap-0.5 px-5 pb-5 pt-2 text-xs">
              {card.footer.trendText && (
                <div className="flex items-center gap-1.5 font-semibold text-slate-700 dark:text-zinc-300">
                  <span>{card.footer.trendText}</span>
                  {card.footer.trend === "up" && (
                    <TrendingUp className="h-3.5 w-3.5 text-emerald-500" />
                  )}
                  {card.footer.trend === "down" && (
                    <TrendingDown className="h-3.5 w-3.5 text-rose-500" />
                  )}
                </div>
              )}
              {card.footer.subtext && (
                <div className="text-[11px] text-slate-400 dark:text-zinc-500">
                  {card.footer.subtext}
                </div>
              )}
            </CardFooter>
          )}
        </Card>
      ))}
    </div>
  );
}

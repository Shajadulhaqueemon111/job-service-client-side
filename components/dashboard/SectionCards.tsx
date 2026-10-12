"use client";

import React from "react";
import { TrendingUp, TrendingDown } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

export interface MetricCardItem {
  title: string;
  value: string | number;
  badge?: {
    text: string;
    trend?: "up" | "down" | "neutral";
  };
  footer?: {
    text?: string;
    trendText?: string;
    trend?: "up" | "down";
  };
  icon?: React.ReactNode;
  gradient?: string;
  actionNode?: React.ReactNode;
  customFooter?: React.ReactNode;
}

interface SectionCardsProps {
  cards: MetricCardItem[];
  className?: string;
}

export function SectionCards({ cards, className }: SectionCardsProps) {
  return (
    <div className={cn("grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4", className)}>
      {cards.map((c, idx) => (
        <Card
          key={idx}
          className="relative overflow-hidden border border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-slate-900/90 shadow-xs hover:shadow-md transition-all group rounded-2xl flex flex-col justify-between"
        >
          <div>
            <CardHeader className="p-5 pb-2 relative">
              <div className="flex items-center justify-between pr-14">
                <CardDescription className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  {c.title}
                </CardDescription>
              </div>

              <CardTitle className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white tabular-nums mt-1">
                {c.value}
              </CardTitle>

              {c.badge && (
                <CardAction className="right-4 top-4">
                  <Badge
                    variant="outline"
                    className={cn(
                      "gap-1 text-[11px] font-bold rounded-lg px-2 py-0.5 border shadow-2xs",
                      c.badge.trend === "up" &&
                        "border-emerald-500/20 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400",
                      c.badge.trend === "down" &&
                        "border-rose-500/20 bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400",
                      (!c.badge.trend || c.badge.trend === "neutral") &&
                        "border-slate-200 bg-slate-50 text-slate-700 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-300"
                    )}
                  >
                    {c.badge.trend === "up" && <TrendingUp className="h-3 w-3" />}
                    {c.badge.trend === "down" && <TrendingDown className="h-3 w-3" />}
                    <span>{c.badge.text}</span>
                  </Badge>
                </CardAction>
              )}

              {c.actionNode && !c.badge && (
                <CardAction className="right-4 top-4">
                  {c.actionNode}
                </CardAction>
              )}
            </CardHeader>
          </div>

          {c.customFooter ? (
            <div className="px-5 pb-4 pt-1 border-t border-slate-100 dark:border-slate-800/80">
              {c.customFooter}
            </div>
          ) : c.footer ? (
            <CardFooter className="px-5 pb-5 pt-2 flex flex-col items-start gap-1 text-xs">
              {c.footer.trendText && (
                <div className="flex items-center gap-1.5 font-medium text-slate-700 dark:text-slate-300">
                  <span>{c.footer.trendText}</span>
                  {c.footer.trend === "up" && (
                    <TrendingUp className="h-3.5 w-3.5 text-emerald-500" />
                  )}
                  {c.footer.trend === "down" && (
                    <TrendingDown className="h-3.5 w-3.5 text-rose-500" />
                  )}
                </div>
              )}
              {c.footer.text && (
                <div className="text-[11px] text-slate-400 dark:text-slate-500">
                  {c.footer.text}
                </div>
              )}
            </CardFooter>
          ) : null}
        </Card>
      ))}
    </div>
  );
}

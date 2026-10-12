"use client";

import React, { useState, useMemo } from "react";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart";
import { cn } from "@/lib/utils";

export interface InteractiveChartPoint {
  date: string;
  [key: string]: string | number;
}

interface ChartAreaInteractiveProps {
  title: string;
  description?: string;
  data: InteractiveChartPoint[];
  config: ChartConfig;
  primaryKey: string;
  secondaryKey?: string;
  className?: string;
}

export function ChartAreaInteractive({
  title,
  description,
  data,
  config,
  primaryKey,
  secondaryKey,
  className,
}: ChartAreaInteractiveProps) {
  const [timeRange, setTimeRange] = useState<"30d" | "7d" | "all">("30d");

  const filteredData = useMemo(() => {
    if (!data || data.length === 0) return [];
    if (timeRange === "7d") {
      return data.slice(-7);
    }
    if (timeRange === "30d") {
      return data.slice(-30);
    }
    return data;
  }, [data, timeRange]);

  const primaryColor =
    (config[primaryKey]?.color as string) || "var(--color-primary, #10b981)";
  const secondaryColor =
    secondaryKey && config[secondaryKey]?.color
      ? (config[secondaryKey].color as string)
      : "#0ea5e9";

  return (
    <Card className={cn("border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900/90 shadow-xs rounded-3xl", className)}>
      <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 gap-4">
        <div>
          <CardTitle className="text-lg font-bold text-slate-900 dark:text-white">
            {title}
          </CardTitle>
          {description && (
            <CardDescription className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {description}
            </CardDescription>
          )}
        </div>

        {/* Timeframe Select Pills */}
        <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setTimeRange("7d")}
            className={cn(
              "px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer",
              timeRange === "7d"
                ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs"
                : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
            )}
          >
            Last 7 Days
          </button>
          <button
            type="button"
            onClick={() => setTimeRange("30d")}
            className={cn(
              "px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer",
              timeRange === "30d"
                ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs"
                : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
            )}
          >
            Last 30 Days
          </button>
          <button
            type="button"
            onClick={() => setTimeRange("all")}
            className={cn(
              "px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer",
              timeRange === "all"
                ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs"
                : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
            )}
          >
            All Time
          </button>
        </div>
      </CardHeader>

      <CardContent className="pt-2 px-2 sm:px-6">
        <ChartContainer config={config} className="aspect-auto h-[260px] sm:h-[300px] w-full">
          <AreaChart data={filteredData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id={`gradient-${primaryKey}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={primaryColor} stopOpacity={0.4} />
                <stop offset="95%" stopColor={primaryColor} stopOpacity={0.0} />
              </linearGradient>
              {secondaryKey && (
                <linearGradient id={`gradient-${secondaryKey}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={secondaryColor} stopOpacity={0.4} />
                  <stop offset="95%" stopColor={secondaryColor} stopOpacity={0.0} />
                </linearGradient>
              )}
            </defs>

            <CartesianGrid vertical={false} strokeDasharray="3 3" opacity={0.15} />

            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={32}
              tickFormatter={(value) => {
                if (!value) return "";
                const date = new Date(value);
                if (isNaN(date.getTime())) return String(value);
                return date.toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                });
              }}
              style={{ fontSize: "11px", fill: "currentColor", opacity: 0.6 }}
            />

            <YAxis
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              style={{ fontSize: "11px", fill: "currentColor", opacity: 0.6 }}
            />

            <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="dot" />} />

            {secondaryKey && (
              <Area
                dataKey={secondaryKey}
                type="natural"
                fill={`url(#gradient-${secondaryKey})`}
                stroke={secondaryColor}
                strokeWidth={2}
                stackId="b"
              />
            )}

            <Area
              dataKey={primaryKey}
              type="natural"
              fill={`url(#gradient-${primaryKey})`}
              stroke={primaryColor}
              strokeWidth={2}
              stackId="a"
            />

            {secondaryKey && <ChartLegend content={<ChartLegendContent />} />}
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}

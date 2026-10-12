"use client";

import * as React from "react";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { cn } from "@/lib/utils";

export interface ChartDataPoint {
  date: string;
  [key: string]: string | number;
}

interface ChartAreaInteractiveProps {
  title?: string;
  description?: string;
  data: ChartDataPoint[];
  config?: ChartConfig;
  primaryKey?: string;
  secondaryKey?: string;
}

const defaultChartConfig = {
  bookings: {
    label: "Service Requests",
    color: "#10b981", // Emerald 500
  },
  completed: {
    label: "Completed",
    color: "#06b6d4", // Cyan 500
  },
} satisfies ChartConfig;

export function ChartAreaInteractive({
  title = "Service Booking Activity",
  description = "Volume of service bookings over time",
  data,
  config = defaultChartConfig,
  primaryKey = "bookings",
  secondaryKey = "completed",
}: ChartAreaInteractiveProps) {
  const [timeRange, setTimeRange] = React.useState<"all" | "30d" | "7d">("30d");

  const filteredData = React.useMemo(() => {
    if (!data || data.length === 0) {
      const today = new Date();
      return Array.from({ length: 7 }).map((_, i) => {
        const d = new Date();
        d.setDate(today.getDate() - (6 - i));
        return {
          date: d.toISOString().split("T")[0],
          [primaryKey]: 0,
          ...(secondaryKey ? { [secondaryKey]: 0 } : {}),
        };
      });
    }

    if (timeRange === "7d") return data.slice(-7);
    if (timeRange === "30d") return data.slice(-30);
    return data;
  }, [data, timeRange, primaryKey, secondaryKey]);

  return (
    <Card className="rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/90 text-slate-900 dark:text-zinc-100 shadow-xs">
      <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 gap-4 p-5 sm:p-6 border-b border-slate-100 dark:border-zinc-800/80">
        <div>
          <CardTitle className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
            {title}
          </CardTitle>
          <CardDescription className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
            {description}
          </CardDescription>
        </div>

        {/* Timeframe pill toggle matching dashboard-01 */}
        <div className="flex items-center gap-1 rounded-xl bg-slate-100 dark:bg-zinc-800/80 p-1 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setTimeRange("7d")}
            className={cn(
              "rounded-lg px-3 py-1 text-xs font-semibold transition-all cursor-pointer",
              timeRange === "7d"
                ? "bg-white dark:bg-zinc-900 text-slate-900 dark:text-white shadow-xs font-bold"
                : "text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white"
            )}
          >
            Last 7 days
          </button>
          <button
            type="button"
            onClick={() => setTimeRange("30d")}
            className={cn(
              "rounded-lg px-3 py-1 text-xs font-semibold transition-all cursor-pointer",
              timeRange === "30d"
                ? "bg-white dark:bg-zinc-900 text-slate-900 dark:text-white shadow-xs font-bold"
                : "text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white"
            )}
          >
            Last 30 days
          </button>
          <button
            type="button"
            onClick={() => setTimeRange("all")}
            className={cn(
              "rounded-lg px-3 py-1 text-xs font-semibold transition-all cursor-pointer",
              timeRange === "all"
                ? "bg-white dark:bg-zinc-900 text-slate-900 dark:text-white shadow-xs font-bold"
                : "text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white"
            )}
          >
            All time
          </button>
        </div>
      </CardHeader>

      <CardContent className="px-2 pt-4 pb-4 sm:px-6">
        <ChartContainer config={config} className="h-[260px] w-full">
          <AreaChart data={filteredData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="fillPrimary" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
              </linearGradient>
              {secondaryKey && (
                <linearGradient id="fillSecondary" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.0} />
                </linearGradient>
              )}
            </defs>

            <CartesianGrid vertical={false} strokeDasharray="3 3" opacity={0.15} />

            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={28}
              tickFormatter={(value) => {
                if (!value) return "";
                const d = new Date(value);
                if (isNaN(d.getTime())) return String(value);
                return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
              }}
              className="text-[11px] font-medium"
            />
            <YAxis tickLine={false} axisLine={false} tickMargin={8} className="text-[11px]" />

            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent indicator="dot" />}
            />

            <Area
              dataKey={primaryKey}
              type="monotone"
              fill="url(#fillPrimary)"
              stroke="#10b981"
              strokeWidth={2}
            />
            {secondaryKey && (
              <Area
                dataKey={secondaryKey}
                type="monotone"
                fill="url(#fillSecondary)"
                stroke="#06b6d4"
                strokeWidth={2}
              />
            )}
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}

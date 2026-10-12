"use client";

import * as React from "react";
import { Clock, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

export interface TimePickerProps {
  value?: string;
  onChange?: (timeString: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  required?: boolean;
  clearable?: boolean;
  id?: string;
  name?: string;
  nowText?: string;
  okText?: string;
}

// 12-hour values
const HOURS = Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, "0"));
// 60-minute values
const MINUTES = Array.from({ length: 60 }, (_, i) => String(i).padStart(2, "0"));
// Periods
const PERIODS = ["AM", "PM"] as const;

interface ParsedTime {
  hour: string;
  minute: string;
  period: "AM" | "PM";
}

function parseTimeString(timeStr?: string): ParsedTime {
  if (!timeStr || typeof timeStr !== "string" || !timeStr.trim()) {
    return { hour: "10", minute: "00", period: "AM" };
  }

  // Matches "10:30 AM", "10:30AM", "10:30 pm", "09:15", "14:20"
  const match12 = timeStr.trim().match(/^(\d{1,2}):(\d{2})\s*(am|pm)?$/i);
  if (match12) {
    let rawHour = parseInt(match12[1], 10);
    const rawMinute = parseInt(match12[2], 10);
    let period: "AM" | "PM" = (match12[3]?.toUpperCase() as "AM" | "PM") || "AM";

    if (!match12[3]) {
      // 24-hour fallback
      if (rawHour >= 12) {
        period = "PM";
        if (rawHour > 12) rawHour -= 12;
      } else if (rawHour === 0) {
        rawHour = 12;
        period = "AM";
      }
    } else {
      if (rawHour > 12) rawHour = 12;
      if (rawHour < 1) rawHour = 1;
    }

    const clampedMinute = Math.min(59, Math.max(0, rawMinute));
    return {
      hour: String(rawHour).padStart(2, "0"),
      minute: String(clampedMinute).padStart(2, "0"),
      period,
    };
  }

  return { hour: "10", minute: "00", period: "AM" };
}

function getCurrentTimeParsed(): ParsedTime {
  const now = new Date();
  let h = now.getHours();
  const m = now.getMinutes();
  const period: "AM" | "PM" = h >= 12 ? "PM" : "AM";
  h = h % 12 || 12;

  return {
    hour: String(h).padStart(2, "0"),
    minute: String(m).padStart(2, "0"),
    period,
  };
}

export function TimePicker({
  value,
  onChange,
  placeholder = "Select time",
  disabled = false,
  className,
  required = false,
  clearable = true,
  id,
  name,
  nowText = "Now",
  okText = "OK",
}: TimePickerProps) {
  const [open, setOpen] = React.useState(false);

  const parsed = React.useMemo(() => parseTimeString(value), [value]);
  const [selectedHour, setSelectedHour] = React.useState(parsed.hour);
  const [selectedMinute, setSelectedMinute] = React.useState(parsed.minute);
  const [selectedPeriod, setSelectedPeriod] = React.useState<"AM" | "PM">(parsed.period);

  // Sync internal state when external value changes
  React.useEffect(() => {
    if (value) {
      const p = parseTimeString(value);
      setSelectedHour(p.hour);
      setSelectedMinute(p.minute);
      setSelectedPeriod(p.period);
    }
  }, [value]);

  const hoursContainerRef = React.useRef<HTMLDivElement>(null);
  const minutesContainerRef = React.useRef<HTMLDivElement>(null);
  const periodsContainerRef = React.useRef<HTMLDivElement>(null);

  // Smoothly center the active item inside a column container without scrolling the window
  const scrollToActive = React.useCallback(
    (container: HTMLDivElement | null, activeVal: string, dataAttr: string) => {
      if (!container) return;
      const target = container.querySelector(`[${dataAttr}="${activeVal}"]`) as HTMLElement;
      if (target) {
        const topPos = target.offsetTop - container.clientHeight / 2 + target.clientHeight / 2;
        container.scrollTo({ top: Math.max(0, topPos), behavior: "smooth" });
      }
    },
    []
  );

  // Scroll to active elements when popover opens or values change
  React.useEffect(() => {
    if (open) {
      const timer = setTimeout(() => {
        scrollToActive(hoursContainerRef.current, selectedHour, "data-hour");
        scrollToActive(minutesContainerRef.current, selectedMinute, "data-minute");
        scrollToActive(periodsContainerRef.current, selectedPeriod, "data-period");
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [open, selectedHour, selectedMinute, selectedPeriod, scrollToActive]);

  const emitChange = (h: string, m: string, p: "AM" | "PM") => {
    const formatted = `${h}:${m} ${p}`;
    onChange?.(formatted);
  };

  const handleSelectHour = (h: string) => {
    setSelectedHour(h);
    emitChange(h, selectedMinute, selectedPeriod);
    scrollToActive(hoursContainerRef.current, h, "data-hour");
  };

  const handleSelectMinute = (m: string) => {
    setSelectedMinute(m);
    emitChange(selectedHour, m, selectedPeriod);
    scrollToActive(minutesContainerRef.current, m, "data-minute");
  };

  const handleSelectPeriod = (p: "AM" | "PM") => {
    setSelectedPeriod(p);
    emitChange(selectedHour, selectedMinute, p);
    scrollToActive(periodsContainerRef.current, p, "data-period");
  };

  const handleNow = () => {
    const cur = getCurrentTimeParsed();
    setSelectedHour(cur.hour);
    setSelectedMinute(cur.minute);
    setSelectedPeriod(cur.period);
    emitChange(cur.hour, cur.minute, cur.period);
    scrollToActive(hoursContainerRef.current, cur.hour, "data-hour");
    scrollToActive(minutesContainerRef.current, cur.minute, "data-minute");
    scrollToActive(periodsContainerRef.current, cur.period, "data-period");
  };

  const handleOk = () => {
    emitChange(selectedHour, selectedMinute, selectedPeriod);
    setOpen(false);
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange?.("");
  };

  const hasValue = Boolean(value && value.trim());

  return (
    <div className="relative w-full">
      {name && <input type="hidden" name={name} value={value || ""} required={required} />}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button
            id={id}
            type="button"
            disabled={disabled}
            className={cn(
              "flex h-11 w-full items-center justify-between rounded-xl border border-slate-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-950/80 px-3.5 py-2 text-sm text-left font-medium transition-all hover:border-slate-300 dark:hover:border-zinc-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 disabled:cursor-not-allowed disabled:opacity-50 shadow-xs",
              !hasValue && "text-slate-400 dark:text-zinc-500",
              hasValue && "text-slate-900 dark:text-zinc-100 font-semibold",
              open && "border-emerald-500/60 ring-2 ring-emerald-500/20",
              className
            )}
          >
            <div className="flex items-center gap-2 truncate">
              <Clock className="h-4 w-4 shrink-0 opacity-70 text-slate-500 dark:text-zinc-400" />
              <span>{hasValue ? value : placeholder}</span>
            </div>

            <div className="flex items-center gap-1 shrink-0">
              {clearable && hasValue && !disabled && (
                <span
                  role="button"
                  tabIndex={0}
                  onClick={handleClear}
                  className="p-1 rounded-md text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors"
                  title="Clear time"
                >
                  <X className="h-3.5 w-3.5" />
                </span>
              )}
            </div>
          </button>
        </PopoverTrigger>

        <PopoverContent
          align="start"
          sideOffset={6}
          className="p-0 border-0 shadow-none bg-transparent"
        >
          <div className="w-[280px] rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-2xl overflow-hidden animate-in fade-in-0 zoom-in-95 duration-150">
            {/* Column Headers */}
            <div className="grid grid-cols-3 border-b border-slate-100 dark:border-zinc-800 bg-slate-50/70 dark:bg-zinc-900/60 text-[11px] font-semibold text-slate-400 dark:text-zinc-400 select-none">
              <div className="py-2 text-center border-r border-slate-100 dark:border-zinc-800">Hour</div>
              <div className="py-2 text-center border-r border-slate-100 dark:border-zinc-800">Minute</div>
              <div className="py-2 text-center">Period</div>
            </div>

            {/* Scrollable Columns Body */}
            <div className="grid grid-cols-3 h-52 text-sm select-none divide-x divide-slate-100 dark:divide-zinc-800 bg-white dark:bg-zinc-900">
              {/* Hours Column */}
              <div
                ref={hoursContainerRef}
                className="overflow-y-auto overscroll-contain py-1.5 px-1 scroll-smooth scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-zinc-700"
              >
                {HOURS.map((h) => {
                  const isSelected = selectedHour === h;
                  return (
                    <button
                      key={h}
                      type="button"
                      data-hour={h}
                      onClick={() => handleSelectHour(h)}
                      className={cn(
                        "w-full py-1.5 px-2 my-0.5 text-xs font-semibold rounded-lg text-center transition-all cursor-pointer",
                        isSelected
                          ? "bg-emerald-500 text-white shadow-xs font-bold scale-[1.02]"
                          : "text-slate-700 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800 hover:text-emerald-600 dark:hover:text-emerald-400"
                      )}
                    >
                      {h}
                    </button>
                  );
                })}
              </div>

              {/* Minutes Column */}
              <div
                ref={minutesContainerRef}
                className="overflow-y-auto overscroll-contain py-1.5 px-1 scroll-smooth scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-zinc-700"
              >
                {MINUTES.map((m) => {
                  const isSelected = selectedMinute === m;
                  return (
                    <button
                      key={m}
                      type="button"
                      data-minute={m}
                      onClick={() => handleSelectMinute(m)}
                      className={cn(
                        "w-full py-1.5 px-2 my-0.5 text-xs font-semibold rounded-lg text-center transition-all cursor-pointer",
                        isSelected
                          ? "bg-emerald-500 text-white shadow-xs font-bold scale-[1.02]"
                          : "text-slate-700 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800 hover:text-emerald-600 dark:hover:text-emerald-400"
                      )}
                    >
                      {m}
                    </button>
                  );
                })}
              </div>

              {/* AM / PM Column */}
              <div
                ref={periodsContainerRef}
                className="overflow-y-auto overscroll-contain py-1.5 px-1 flex flex-col justify-center gap-1.5 scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-zinc-700"
              >
                {PERIODS.map((p) => {
                  const isSelected = selectedPeriod === p;
                  return (
                    <button
                      key={p}
                      type="button"
                      data-period={p}
                      onClick={() => handleSelectPeriod(p)}
                      className={cn(
                        "w-full py-2 px-2 text-xs font-bold rounded-lg text-center transition-all cursor-pointer",
                        isSelected
                          ? "bg-emerald-500 text-white shadow-xs font-bold scale-[1.02]"
                          : "text-slate-700 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800 hover:text-emerald-600 dark:hover:text-emerald-400"
                      )}
                    >
                      {p}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Bottom Action Bar */}
            <div className="flex items-center justify-between px-3.5 py-2.5 border-t border-slate-100 dark:border-zinc-800 bg-slate-50/70 dark:bg-zinc-900/90">
              <button
                type="button"
                onClick={handleNow}
                className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 hover:underline transition-colors cursor-pointer"
              >
                {nowText}
              </button>
              <button
                type="button"
                onClick={handleOk}
                className="px-3.5 py-1 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition-colors cursor-pointer"
              >
                {okText}
              </button>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}

export default TimePicker;

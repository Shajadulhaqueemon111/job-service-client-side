"use client";

import * as React from "react";
import { Calendar as CalendarIcon, X } from "lucide-react";

import { cn, formatDateBD } from "@/lib/utils";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

export interface DatePickerProps {
  value?: string | Date | null;
  onChange?: (dateString: string) => void;
  onSelect?: (date: Date | undefined) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  calendarClassName?: string;
  minDate?: Date;
  maxDate?: Date;
  fromYear?: number;
  toYear?: number;
  required?: boolean;
  clearable?: boolean;
  id?: string;
  name?: string;
}

export function DatePicker({
  value,
  onChange,
  onSelect,
  placeholder = "Select date",
  disabled = false,
  className,
  calendarClassName,
  minDate,
  maxDate,
  fromYear,
  toYear,
  required,
  clearable = true,
  id,
  name,
}: DatePickerProps) {
  const [open, setOpen] = React.useState(false);

  // Normalize value to a valid Date object
  const selectedDate = React.useMemo(() => {
    if (!value) return undefined;
    if (value instanceof Date) return isNaN(value.getTime()) ? undefined : value;
    const parsed = new Date(value);
    return isNaN(parsed.getTime()) ? undefined : parsed;
  }, [value]);

  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      // Format as YYYY-MM-DD for standard form compatibility
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      const formattedStr = `${year}-${month}-${day}`;

      onChange?.(formattedStr);
      onSelect?.(date);
    } else {
      onChange?.("");
      onSelect?.(undefined);
    }
    setOpen(false);
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange?.("");
    onSelect?.(undefined);
  };

  const formattedDisplay = selectedDate ? formatDateBD(selectedDate) : null;
  const hiddenValue = selectedDate
    ? `${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, "0")}-${String(selectedDate.getDate()).padStart(2, "0")}`
    : "";

  return (
    <div className="relative w-full">
      {name && <input type="hidden" name={name} value={hiddenValue} required={required} />}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button
            id={id}
            type="button"
            disabled={disabled}
            className={cn(
              "flex h-11 w-full items-center justify-between rounded-xl border border-slate-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-950/80 px-3.5 py-2 text-sm text-left font-medium transition-all hover:border-slate-300 dark:hover:border-zinc-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 disabled:cursor-not-allowed disabled:opacity-50 shadow-xs",
              !selectedDate && "text-slate-400 dark:text-zinc-500",
              selectedDate && "text-slate-900 dark:text-zinc-100 font-semibold",
              className
            )}
          >
            <div className="flex items-center gap-2 truncate">
              <CalendarIcon className="h-4 w-4 shrink-0 opacity-70 text-slate-500 dark:text-zinc-400" />
              <span>{formattedDisplay || placeholder}</span>
            </div>

            {clearable && selectedDate && !disabled && (
              <span
                role="button"
                tabIndex={0}
                onClick={handleClear}
                className="p-1 rounded-md text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors"
                title="Clear date"
              >
                <X className="h-3.5 w-3.5" />
              </span>
            )}
          </button>
        </PopoverTrigger>

        <PopoverContent align="start" className="p-0 border-0 shadow-none bg-transparent">
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={handleDateSelect}
            disabled={(date) => {
              if (minDate && date < new Date(minDate.setHours(0, 0, 0, 0))) return true;
              if (maxDate && date > new Date(maxDate.setHours(23, 59, 59, 999))) return true;
              return false;
            }}
            captionLayout="dropdown"
            startMonth={fromYear ? new Date(fromYear, 0) : undefined}
            endMonth={toYear ? new Date(toYear, 11) : new Date(new Date().getFullYear(), 11)}
            className={calendarClassName}
            defaultMonth={selectedDate || new Date()}
            autoFocus
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}

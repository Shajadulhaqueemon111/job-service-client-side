"use client";

import * as React from "react";
import { Check, ChevronDown, ChevronLeft, ChevronRight, ChevronUp } from "lucide-react";
import { DayPicker, type DayPickerProps, type DropdownProps } from "react-day-picker";

import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";

function CustomCalendarDropdown(props: DropdownProps) {
  const { options, value, onChange, disabled, "aria-label": ariaLabel } = props;
  const [isOpen, setIsOpen] = React.useState(false);
  const containerRef = React.useRef<HTMLDivElement>(null);
  const listRef = React.useRef<HTMLDivElement>(null);

  // Close when clicking outside or pressing Escape
  React.useEffect(() => {
    if (!isOpen) return;

    const handlePointerDown = (e: MouseEvent | TouchEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("touchstart", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("touchstart", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  // Auto scroll active option into view when opened
  React.useEffect(() => {
    if (isOpen && listRef.current) {
      const activeEl = listRef.current.querySelector("[data-selected='true']");
      if (activeEl) {
        activeEl.scrollIntoView({ block: "center" });
      }
    }
  }, [isOpen]);

  // Ensure year dropdown never shows future years beyond current year
  const currentYear = new Date().getFullYear();
  const filteredOptions = React.useMemo(() => {
    if (!options) return [];
    const isYearDropdown = options.some((opt) => opt.value > 100);
    if (isYearDropdown) {
      return options.filter((opt) => opt.value <= currentYear);
    }
    return options;
  }, [options, currentYear]);

  const selectedOption = filteredOptions.find((opt) => opt.value === Number(value));

  const handleSelect = (optValue: number) => {
    if (onChange) {
      onChange({
        target: { value: String(optValue) },
      } as unknown as React.ChangeEvent<HTMLSelectElement>);
    }
    setIsOpen(false);
  };

  const scrollUp = () => {
    if (listRef.current) {
      listRef.current.scrollBy({ top: -60, behavior: "smooth" });
    }
  };

  const scrollDown = () => {
    if (listRef.current) {
      listRef.current.scrollBy({ top: 60, behavior: "smooth" });
    }
  };

  return (
    <div ref={containerRef} className="relative inline-flex items-center">
      {/* Header Button: e.g. "Oct ⌵" or "2026 ⌵" */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen((prev) => !prev)}
        aria-label={ariaLabel}
        aria-expanded={isOpen}
        className={cn(
          "flex items-center gap-1 text-sm font-bold text-slate-800 dark:text-zinc-100 hover:bg-slate-100 dark:hover:bg-zinc-800/80 px-2 py-1 rounded-xl transition-all cursor-pointer select-none",
          isOpen && "bg-slate-100 dark:bg-zinc-800/90 text-emerald-600 dark:text-emerald-400 ring-1 ring-emerald-500/30"
        )}
      >
        <span>{selectedOption?.label ?? value}</span>
        <ChevronDown
          className={cn(
            "h-3.5 w-3.5 text-slate-400 dark:text-zinc-400 transition-transform duration-200",
            isOpen && "rotate-180 text-emerald-600 dark:text-emerald-400"
          )}
        />
      </button>

      {/* Floating Custom Dropdown Card */}
      {isOpen && filteredOptions.length > 0 && (
        <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 z-[100] w-28 sm:w-32 rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-1.5 shadow-2xl animate-in fade-in-0 zoom-in-95 duration-150 flex flex-col">
          {/* Top scroll chevron */}
          <button
            type="button"
            onClick={scrollUp}
            className="w-full flex items-center justify-center py-1 text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200 hover:bg-slate-100/60 dark:hover:bg-zinc-900 rounded-lg transition-colors cursor-pointer"
          >
            <ChevronUp className="h-3.5 w-3.5" />
          </button>

          {/* Scrollable list of items */}
          <div
            ref={listRef}
            className="overflow-y-auto max-h-48 space-y-0.5 pr-0.5 no-scrollbar scroll-smooth [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
            {filteredOptions.map((opt) => {
              const isSelected = opt.value === Number(value);
              return (
                <button
                  key={opt.value}
                  type="button"
                  disabled={opt.disabled}
                  data-selected={isSelected}
                  onClick={() => handleSelect(opt.value)}
                  className={cn(
                    "w-full flex items-center justify-between px-3 py-1.5 text-xs font-semibold rounded-xl text-left transition-colors cursor-pointer",
                    isSelected
                      ? "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 font-bold"
                      : "text-slate-700 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800/80",
                    opt.disabled && "opacity-30 cursor-not-allowed pointer-events-none"
                  )}
                >
                  <span className="truncate">{opt.label}</span>
                  {isSelected && (
                    <Check className="h-3.5 w-3.5 shrink-0 text-emerald-600 dark:text-emerald-400 ml-1.5" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Bottom scroll chevron */}
          <button
            type="button"
            onClick={scrollDown}
            className="w-full flex items-center justify-center py-1 text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200 hover:bg-slate-100/60 dark:hover:bg-zinc-900 rounded-lg transition-colors cursor-pointer"
          >
            <ChevronDown className="h-3.5 w-3.5" />
          </button>
        </div>
      )}
    </div>
  );
}

export type CalendarProps = DayPickerProps & {
  className?: string;
  classNames?: DayPickerProps["classNames"];
  showOutsideDays?: boolean;
};

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  captionLayout = "dropdown",
  navLayout = "around",
  startMonth,
  endMonth,
  formatters,
  components,
  ...props
}: CalendarProps) {
  const currentYear = new Date().getFullYear();
  const defaultStartMonth = startMonth ?? new Date(currentYear - 80, 0);
  const defaultEndMonth = endMonth ?? new Date(currentYear, 11);

  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      captionLayout={captionLayout}
      navLayout={navLayout}
      startMonth={defaultStartMonth}
      endMonth={defaultEndMonth}
      className={cn(
        "p-3 bg-white dark:bg-zinc-950 text-slate-900 dark:text-zinc-100 border border-slate-200 dark:border-zinc-800 rounded-2xl shadow-2xl inline-block",
        className
      )}
      classNames={{
        months: "flex flex-col sm:flex-row gap-4",
        month: "relative space-y-3",
        month_caption: "flex justify-center items-center h-8 mx-8 relative",
        caption_label:
          "flex items-center gap-0.5 text-sm font-bold text-slate-900 dark:text-zinc-100 tracking-tight select-none pointer-events-none",
        dropdowns: "flex items-center gap-1.5 justify-center",
        dropdown_root: "relative inline-flex items-center",
        dropdown: "hidden",
        months_dropdown: "",
        years_dropdown: "",
        chevron: "h-3.5 w-3.5 opacity-70 shrink-0 ml-0.5 text-slate-500 dark:text-zinc-400",
        nav: "flex items-center gap-1",
        button_previous: cn(
          buttonVariants({ variant: "ghost" }),
          "h-7 w-7 bg-transparent p-0 opacity-70 hover:opacity-100 rounded-lg absolute left-0 top-0.5 z-10 text-slate-600 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800 flex items-center justify-center transition-colors"
        ),
        button_next: cn(
          buttonVariants({ variant: "ghost" }),
          "h-7 w-7 bg-transparent p-0 opacity-70 hover:opacity-100 rounded-lg absolute right-0 top-0.5 z-10 text-slate-600 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800 flex items-center justify-center transition-colors"
        ),
        month_grid: "w-full border-collapse space-y-1",
        weekdays: "flex w-full justify-between mb-1",
        weekday:
          "text-slate-400 dark:text-zinc-400 rounded-md w-9 font-medium text-[0.8rem] text-center select-none",
        weeks: "space-y-1",
        week: "flex w-full mt-1 justify-between",
        day: "h-9 w-9 text-center text-sm p-0 relative focus-within:relative focus-within:z-20 flex items-center justify-center",
        day_button: cn(
          buttonVariants({ variant: "ghost" }),
          "h-9 w-9 p-0 font-normal rounded-xl transition-all hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-200"
        ),
        range_end: "day-range-end",
        selected:
          "[&>button]:!bg-zinc-900 [&>button]:!text-white dark:[&>button]:!bg-zinc-800 dark:[&>button]:!text-white [&>button]:hover:!bg-zinc-800 dark:[&>button]:hover:!bg-zinc-700 [&>button]:focus:!bg-zinc-800 dark:[&>button]:focus:!bg-zinc-700 [&>button]:font-bold [&>button]:rounded-xl [&>button]:shadow-sm",
        today:
          "[&:not(.selected)>button]:font-bold [&:not(.selected)>button]:text-emerald-600 dark:[&:not(.selected)>button]:text-emerald-400",
        outside:
          "day-outside text-slate-300 dark:text-zinc-600 opacity-40 aria-selected:opacity-30",
        disabled:
          "text-slate-300 dark:text-zinc-700 opacity-30 cursor-not-allowed hover:bg-transparent dark:hover:bg-transparent",
        range_middle:
          "aria-selected:bg-emerald-50 dark:aria-selected:bg-emerald-950/40 aria-selected:text-emerald-800 dark:aria-selected:text-emerald-300",
        hidden: "invisible",
        ...classNames,
      }}
      formatters={{
        formatMonthDropdown: (date, dateLib) =>
          dateLib ? dateLib.format(date, "LLL") : date.toLocaleString("default", { month: "short" }),
        ...formatters,
      }}
      components={{
        Dropdown: CustomCalendarDropdown,
        Chevron: ({ orientation, className: chevronClassName }) => {
          if (orientation === "left") {
            return <ChevronLeft className={cn("h-4 w-4", chevronClassName)} />;
          }
          if (orientation === "right") {
            return <ChevronRight className={cn("h-4 w-4", chevronClassName)} />;
          }
          if (orientation === "down") {
            return (
              <ChevronDown
                className={cn("h-3.5 w-3.5 opacity-70 ml-0.5 inline-block shrink-0", chevronClassName)}
              />
            );
          }
          return (
            <ChevronUp
              className={cn("h-3.5 w-3.5 opacity-70 ml-0.5 inline-block shrink-0", chevronClassName)}
            />
          );
        },
        ...components,
      }}
      {...props}
    />
  );
}
Calendar.displayName = "Calendar";

export { Calendar };

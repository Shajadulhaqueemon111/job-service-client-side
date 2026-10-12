"use client";

import * as React from "react";
import { ChevronDown, Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface SelectContextValue {
  value: string;
  onValueChange: (val: string) => void;
  open: boolean;
  setOpen: (open: boolean) => void;
}

const SelectContext = React.createContext<SelectContextValue | null>(null);

export function Select({
  value: controlledValue,
  defaultValue = "",
  onValueChange,
  children,
}: {
  value?: string;
  defaultValue?: string;
  onValueChange?: (val: string) => void;
  children: React.ReactNode;
}) {
  const [val, setVal] = React.useState(controlledValue || defaultValue);
  const [open, setOpen] = React.useState(false);
  const ref = React.useRef<HTMLDivElement>(null);

  const currentValue = controlledValue !== undefined ? controlledValue : val;

  const handleSelect = (newVal: string) => {
    setVal(newVal);
    onValueChange?.(newVal);
    setOpen(false);
  };

  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  return (
    <SelectContext.Provider
      value={{
        value: currentValue,
        onValueChange: handleSelect,
        open,
        setOpen,
      }}
    >
      <div className="relative inline-block w-fit text-left" ref={ref}>
        {children}
      </div>
    </SelectContext.Provider>
  );
}

export function SelectTrigger({
  children,
  className,
  id,
}: {
  children: React.ReactNode;
  className?: string;
  id?: string;
  "aria-label"?: string;
}) {
  const ctx = React.useContext(SelectContext);

  return (
    <button
      type="button"
      id={id}
      onClick={() => ctx?.setOpen(!ctx.open)}
      className={cn(
        "flex h-9 w-full items-center justify-between rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-3 py-2 text-xs font-medium text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-400 disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer gap-2",
        className
      )}
    >
      {children}
      <ChevronDown className="h-3.5 w-3.5 opacity-50 shrink-0" />
    </button>
  );
}

export function SelectValue({
  placeholder,
}: {
  placeholder?: string;
}) {
  const ctx = React.useContext(SelectContext);
  return <span>{ctx?.value || placeholder}</span>;
}

export function SelectContent({
  children,
  align = "end",
  className,
}: {
  children: React.ReactNode;
  align?: "start" | "end" | "center";
  className?: string;
  side?: string;
}) {
  const ctx = React.useContext(SelectContext);
  if (!ctx?.open) return null;

  return (
    <div
      className={cn(
        "absolute z-50 mt-1 min-w-[8rem] overflow-hidden rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-1 text-zinc-950 dark:text-zinc-50 shadow-md animate-in fade-in-0 zoom-in-95",
        align === "end" ? "right-0" : "left-0",
        className
      )}
    >
      {children}
    </div>
  );
}

export function SelectItem({
  value,
  children,
  className,
}: {
  value: string;
  children: React.ReactNode;
  className?: string;
}) {
  const ctx = React.useContext(SelectContext);
  const isSelected = ctx?.value === value;

  return (
    <div
      role="option"
      aria-selected={isSelected}
      onClick={() => ctx?.onValueChange(value)}
      className={cn(
        "relative flex w-full cursor-pointer select-none items-center rounded-lg py-1.5 pl-8 pr-2 text-xs font-medium outline-none transition-colors hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-200",
        isSelected && "bg-zinc-100 dark:bg-zinc-800 font-bold",
        className
      )}
    >
      <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
        {isSelected && <Check className="h-3.5 w-3.5" />}
      </span>
      {children}
    </div>
  );
}

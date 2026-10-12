"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface ToggleGroupContextValue {
  value: string;
  onValueChange: (val: string) => void;
}

const ToggleGroupContext = React.createContext<ToggleGroupContextValue | null>(null);

export function ToggleGroup({
  type = "single",
  value,
  onValueChange,
  children,
  className,
  variant = "outline",
}: {
  type?: "single" | "multiple";
  value: string;
  onValueChange: (val: string) => void;
  children: React.ReactNode;
  className?: string;
  variant?: "outline" | "default";
}) {
  return (
    <ToggleGroupContext.Provider value={{ value, onValueChange }}>
      <div
        className={cn(
          "inline-flex items-center justify-center rounded-lg bg-zinc-900/40 p-1 border border-zinc-800 text-zinc-400 gap-1",
          className
        )}
      >
        {children}
      </div>
    </ToggleGroupContext.Provider>
  );
}

export function ToggleGroupItem({
  value,
  children,
  className,
}: {
  value: string;
  children: React.ReactNode;
  className?: string;
}) {
  const ctx = React.useContext(ToggleGroupContext);
  const active = ctx?.value === value;

  return (
    <button
      type="button"
      onClick={() => ctx?.onValueChange(value)}
      className={cn(
        "inline-flex items-center justify-center rounded-md px-2.5 py-1 text-xs font-semibold transition-all cursor-pointer",
        active
          ? "bg-zinc-800 text-zinc-100 shadow-xs"
          : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/40",
        className
      )}
    >
      {children}
    </button>
  );
}

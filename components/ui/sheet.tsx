"use client";

import * as React from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

interface SheetContextValue {
  open: boolean;
  setOpen: (open: boolean) => void;
}

const SheetContext = React.createContext<SheetContextValue | null>(null);

export function Sheet({
  children,
  open: controlledOpen,
  onOpenChange,
}: {
  children: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}) {
  const [open, setOpen] = React.useState(controlledOpen || false);
  const currentOpen = controlledOpen !== undefined ? controlledOpen : open;

  const handleOpen = (val: boolean) => {
    setOpen(val);
    onOpenChange?.(val);
  };

  return (
    <SheetContext.Provider value={{ open: currentOpen, setOpen: handleOpen }}>
      {children}
    </SheetContext.Provider>
  );
}

export function SheetTrigger({
  children,
  asChild,
}: {
  children: React.ReactNode;
  asChild?: boolean;
}) {
  const ctx = React.useContext(SheetContext);

  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children as React.ReactElement<{ onClick?: () => void }>, {
      onClick: () => ctx?.setOpen(true),
    });
  }

  return (
    <button type="button" onClick={() => ctx?.setOpen(true)}>
      {children}
    </button>
  );
}

export function SheetClose({
  children,
  asChild,
}: {
  children: React.ReactNode;
  asChild?: boolean;
}) {
  const ctx = React.useContext(SheetContext);

  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children as React.ReactElement<{ onClick?: () => void }>, {
      onClick: () => ctx?.setOpen(false),
    });
  }

  return (
    <button type="button" onClick={() => ctx?.setOpen(false)}>
      {children}
    </button>
  );
}

export function SheetContent({
  children,
  side = "right",
  className,
}: {
  children: React.ReactNode;
  side?: "right" | "left" | "top" | "bottom";
  className?: string;
}) {
  const ctx = React.useContext(SheetContext);
  if (!ctx?.open) return null;

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity animate-in fade-in-0"
        onClick={() => ctx.setOpen(false)}
      />

      {/* Panel */}
      <div
        className={cn(
          "fixed right-0 top-0 z-50 h-full w-full max-w-md border-l border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 shadow-xl transition ease-in-out animate-in slide-in-from-right duration-300 flex flex-col justify-between overflow-y-auto",
          className
        )}
      >
        <button
          type="button"
          onClick={() => ctx.setOpen(false)}
          className="absolute right-4 top-4 rounded-sm opacity-70 hover:opacity-100 transition-opacity"
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </button>
        {children}
      </div>
    </div>
  );
}

export function SheetHeader({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <div className={cn("flex flex-col space-y-1.5 text-left pb-4", className)}>{children}</div>;
}

export function SheetTitle({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <h2 className={cn("text-lg font-bold text-zinc-900 dark:text-zinc-50", className)}>{children}</h2>;
}

export function SheetDescription({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <p className={cn("text-xs text-zinc-500 dark:text-zinc-400", className)}>{children}</p>;
}

export function SheetFooter({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <div className={cn("flex items-center justify-end gap-2 pt-4 border-t border-zinc-200 dark:border-zinc-800", className)}>{children}</div>;
}

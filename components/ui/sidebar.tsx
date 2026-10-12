"use client";

import * as React from "react";
import { PanelLeft } from "lucide-react";
import { cn } from "@/lib/utils";

interface SidebarContextValue {
  open: boolean;
  setOpen: (val: boolean) => void;
  toggleSidebar: () => void;
  isMobile: boolean;
}

const SidebarContext = React.createContext<SidebarContextValue | null>(null);

export function useSidebar() {
  const ctx = React.useContext(SidebarContext);
  if (!ctx) {
    return {
      open: true,
      setOpen: () => {},
      toggleSidebar: () => {},
      isMobile: false,
    };
  }
  return ctx;
}

export function SidebarProvider({
  defaultOpen = true,
  children,
  className,
}: {
  defaultOpen?: boolean;
  children: React.ReactNode;
  className?: string;
}) {
  const [open, setOpen] = React.useState(defaultOpen);
  const [isMobile, setIsMobile] = React.useState(false);

  React.useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      if (mobile) {
        setOpen(false);
      } else {
        setOpen(true);
      }
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const toggleSidebar = () => setOpen((prev) => !prev);

  return (
    <SidebarContext.Provider value={{ open, setOpen, toggleSidebar, isMobile }}>
      <div
        className={cn(
          "h-screen w-screen overflow-hidden flex bg-slate-50 dark:bg-zinc-950 text-slate-900 dark:text-zinc-100",
          className
        )}
      >
        {children}
      </div>
    </SidebarContext.Provider>
  );
}

export function Sidebar({
  children,
  className,
  collapsible = "offcanvas",
  variant = "inset",
}: {
  children: React.ReactNode;
  className?: string;
  collapsible?: "offcanvas" | "icon" | "none";
  variant?: "inset" | "sidebar" | "floating";
}) {
  const { open, isMobile, setOpen } = useSidebar();

  if (isMobile) {
    if (!open) return null;
    return (
      <div className="fixed inset-0 z-50 flex">
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
          onClick={() => setOpen(false)}
        />
        <aside
          className={cn(
            "relative z-50 w-64 h-full bg-white dark:bg-zinc-900 border-r border-slate-200 dark:border-zinc-800 p-4 flex flex-col justify-between overflow-y-auto animate-in slide-in-from-left duration-200",
            className
          )}
        >
          {children}
        </aside>
      </div>
    );
  }

  return (
    <aside
      className={cn(
        "h-screen shrink-0 transition-all duration-200 ease-in-out border-r border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/95 flex flex-col justify-between overflow-y-auto select-none",
        open ? "w-64 p-4" : "w-0 p-0 border-r-0 overflow-hidden",
        className
      )}
    >
      {open && children}
    </aside>
  );
}

export function SidebarHeader({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <div className={cn("flex flex-col gap-2 pb-3", className)}>{children}</div>;
}

export function SidebarContent({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <div className={cn("flex flex-1 flex-col gap-4 overflow-y-auto py-1", className)}>{children}</div>;
}

export function SidebarFooter({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col gap-2 pt-3 border-t border-slate-200 dark:border-zinc-800", className)}>
      {children}
    </div>
  );
}

export function SidebarInset({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-1 h-screen flex-col overflow-hidden bg-slate-50/70 dark:bg-zinc-950",
        className
      )}
    >
      {children}
    </div>
  );
}

export function SidebarGroup({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <div className={cn("flex flex-col gap-1", className)}>{children}</div>;
}

export function SidebarGroupLabel({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "px-2 py-1.5 text-xs font-semibold text-slate-500 dark:text-zinc-500 tracking-wider uppercase",
        className
      )}
    >
      {children}
    </div>
  );
}

export function SidebarGroupContent({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <div className={cn("flex flex-col gap-1", className)}>{children}</div>;
}

export function SidebarMenu({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <ul className={cn("flex flex-col gap-1 list-none p-0 m-0", className)}>{children}</ul>;
}

export function SidebarMenuItem({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <li className={cn("relative", className)}>{children}</li>;
}

export function SidebarMenuButton({
  children,
  className,
  asChild,
  tooltip,
  isActive,
  ...props
}: {
  children: React.ReactNode;
  className?: string;
  asChild?: boolean;
  tooltip?: string;
  isActive?: boolean;
  [key: string]: any;
}) {
  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children as React.ReactElement<any>, {
      className: cn(
        "flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 dark:text-zinc-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-zinc-800/80 transition-colors",
        isActive && "bg-slate-100 dark:bg-zinc-800 text-slate-900 dark:text-white font-bold shadow-2xs",
        (children.props as any).className,
        className
      ),
    });
  }

  return (
    <button
      type="button"
      className={cn(
        "flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 dark:text-zinc-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-zinc-800/80 transition-colors cursor-pointer",
        isActive && "bg-slate-100 dark:bg-zinc-800 text-slate-900 dark:text-white font-bold shadow-2xs",
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}

export function SidebarMenuAction({
  children,
  className,
  showOnHover,
  ...props
}: {
  children: React.ReactNode;
  className?: string;
  showOnHover?: boolean;
  [key: string]: any;
}) {
  return (
    <button
      type="button"
      className={cn(
        "absolute right-1 top-1/2 -translate-y-1/2 flex h-6 w-6 items-center justify-center rounded-md text-slate-400 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-zinc-800",
        showOnHover && "opacity-0 group-hover:opacity-100",
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}

export function SidebarTrigger({
  className,
}: {
  className?: string;
}) {
  const { toggleSidebar } = useSidebar();

  return (
    <button
      type="button"
      onClick={toggleSidebar}
      className={cn(
        "flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer",
        className
      )}
    >
      <PanelLeft className="h-4 w-4" />
      <span className="sr-only">Toggle Sidebar</span>
    </button>
  );
}

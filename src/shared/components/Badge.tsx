"use client";

import { cn } from "@/shared/utils/cn";

const variants = {
  default: "bg-black/5 dark:bg-white/10 text-text-muted border border-black/5 dark:border-white/5",
  primary: "bg-[#007AFF]/10 text-[#007AFF] dark:bg-[#0A84FF]/20 dark:text-[#0A84FF] border border-[#007AFF]/20",
  success: "bg-[#34C759]/10 text-[#34C759] dark:bg-[#30D158]/20 dark:text-[#30D158] border border-[#34C759]/20",
  warning: "bg-[#FFCC00]/10 text-[#D4A000] dark:bg-[#FFD60A]/20 dark:text-[#FFD60A] border border-[#FFCC00]/20",
  error: "bg-[#FF3B30] text-white shadow-sm border border-[#D70015]/50", // High impact red for notification counters
  info: "bg-[#5AC8FA]/10 text-[#007AFF] dark:bg-[#64D2FF]/20 dark:text-[#64D2FF] border border-[#5AC8FA]/20",
};

const sizes = {
  sm: "px-2 py-0.5 text-[10px]",
  md: "px-2.5 py-1 text-xs",
  lg: "px-3 py-1.5 text-sm",
};

interface BadgeProps {
  children?: React.ReactNode;
  variant?: keyof typeof variants;
  size?: keyof typeof sizes;
  dot?: boolean;
  icon?: React.ReactNode;
  className?: string;
}

export default function Badge({
  children,
  variant = "default",
  size = "md",
  dot = false,
  icon,
  className,
}: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full font-semibold",
        variants[variant],
        sizes[size],
        className
      )}
    >
      {dot && (
        <span
          aria-hidden="true"
          className={cn(
            "size-1.5 rounded-full",
            variant === "success" && "bg-green-500",
            variant === "warning" && "bg-yellow-500",
            variant === "error" && "bg-red-500",
            variant === "info" && "bg-blue-500",
            variant === "primary" && "bg-primary",
            variant === "default" && "bg-gray-500"
          )}
        />
      )}
      {icon && (
        <span className="material-symbols-outlined text-[14px]" aria-hidden="true">
          {icon}
        </span>
      )}
      {children}
    </span>
  );
}

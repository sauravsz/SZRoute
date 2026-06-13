"use client";

import { cn } from "@/shared/utils/cn";

const variants = {
  primary:
    "bg-gradient-to-b from-[#479BFF] to-[#007AFF] border border-[#005BCC] text-white shadow-[0_1px_1px_rgba(0,0,0,0.1),inset_0_1px_0_rgba(255,255,255,0.2)] hover:brightness-105",
  secondary:
    "bg-gradient-to-b from-white to-[#F0F0F0] dark:from-[#323232] dark:to-[#222222] border border-black/15 dark:border-white/10 text-text-main shadow-[0_1px_1px_rgba(0,0,0,0.05),inset_0_1px_0_rgba(255,255,255,0.6)] dark:shadow-[0_1px_1px_rgba(0,0,0,0.2),inset_0_1px_0_rgba(255,255,255,0.1)] hover:brightness-95 dark:hover:brightness-110",
  outline: "bg-transparent border border-black/15 dark:border-white/15 text-text-main hover:bg-black/5 dark:hover:bg-white/5",
  ghost: "bg-transparent text-text-main hover:bg-black/5 dark:hover:bg-white/5",
  danger:
    "bg-gradient-to-b from-[#FF5E5E] to-[#E02D2D] border border-[#B31D1D] text-white shadow-[0_1px_1px_rgba(0,0,0,0.1),inset_0_1px_0_rgba(255,255,255,0.2)] hover:brightness-105",
};

const sizes = {
  sm: "h-[24px] px-2.5 text-[11px] rounded-[5px]",
  md: "h-[28px] px-3.5 text-[13px] rounded-[6px]",
  lg: "h-[32px] px-5 text-[14px] rounded-[8px]",
};

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children?: React.ReactNode;
  variant?: keyof typeof variants;
  size?: keyof typeof sizes;
  icon?: string;
  iconRight?: string;
  loading?: boolean;
  fullWidth?: boolean;
  className?: string;
}

export default function Button({
  children,
  variant = "primary",
  size = "md",
  icon,
  iconRight,
  disabled = false,
  loading = false,
  fullWidth = false,
  className,
  ...props
}: ButtonProps) {
  return (
    <button
      type="button"
      className={cn(
        "inline-flex items-center justify-center gap-2 font-medium transition-all duration-200 cursor-pointer focus-ring select-none",
        "active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100",
        variants[variant],
        sizes[size],
        fullWidth && "w-full",
        className
      )}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...props}
    >
      {loading ? (
        <span
          className="material-symbols-outlined animate-spin text-[18px] pointer-events-none"
          aria-hidden="true"
        >
          progress_activity
        </span>
      ) : icon ? (
        <span
          className="material-symbols-outlined text-[18px] pointer-events-none"
          aria-hidden="true"
        >
          {icon}
        </span>
      ) : null}
      {children}
      {iconRight && !loading && (
        <span
          className="material-symbols-outlined text-[18px] pointer-events-none"
          aria-hidden="true"
        >
          {iconRight}
        </span>
      )}
    </button>
  );
}

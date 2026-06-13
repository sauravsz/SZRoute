"use client";

import { cn } from "@/shared/utils/cn";

interface ToggleProps {
  checked?: boolean;
  onChange?: (checked: boolean) => void;
  label?: string;
  description?: string;
  disabled?: boolean;
  size?: "xs" | "sm" | "md" | "lg";
  className?: string;
  title?: string;
  ariaLabel?: string;
}

export default function Toggle({
  checked = false,
  onChange,
  label,
  description,
  disabled = false,
  size = "md",
  className,
  title,
  ariaLabel,
}: ToggleProps) {
  const sizes = {
    xs: {
      track: "w-6 h-3",
      thumb: "size-[8px]",
      translate: "translate-x-3.5",
    },
    sm: {
      track: "w-8 h-4",
      thumb: "size-3",
      translate: "translate-x-4",
    },
    md: {
      track: "w-11 h-6",
      thumb: "size-5",
      translate: "translate-x-5",
    },
    lg: {
      track: "w-14 h-7",
      thumb: "size-6",
      translate: "translate-x-7",
    },
  };

  const handleClick = () => {
    if (!disabled && onChange) {
      onChange(!checked);
    }
  };

  return (
    <div
      className={cn(
        "flex items-center gap-3 select-none",
        disabled && "opacity-50 cursor-not-allowed",
        className
      )}
    >
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={ariaLabel || label || description || title || "Toggle"}
        title={title}
        disabled={disabled}
        onClick={handleClick}
        className={cn(
          "relative inline-flex shrink-0 cursor-pointer rounded-full",
          "transition-colors duration-200",
          "focus-ring",
          checked ? "bg-[#34C759] dark:bg-[#30D158]" : "bg-black/10 dark:bg-white/20 border border-black/5 dark:border-white/5 shadow-inner",
          sizes[size].track,
          disabled && "cursor-not-allowed opacity-50"
        )}
      >
        <span
          aria-hidden="true"
          className={cn(
            "pointer-events-none inline-block rounded-full bg-white shadow-[0_2px_4px_rgba(0,0,0,0.2),0_0_1px_rgba(0,0,0,0.1)]",
            "transform transition-transform duration-300 ease-[cubic-bezier(0.25,1,0.5,1)]",
            checked ? sizes[size].translate : "translate-x-0.5",
            sizes[size].thumb,
            "mt-0.5"
          )}
        />
      </button>
      {(label || description) && (
        <div className="flex flex-col">
          {label && <span className="text-sm font-medium text-text-main">{label}</span>}
          {description && <span className="text-xs text-text-muted">{description}</span>}
        </div>
      )}
    </div>
  );
}

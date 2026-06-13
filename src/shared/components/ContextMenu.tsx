"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/shared/utils/cn";
import { LucideIcon } from "lucide-react";

export interface ContextMenuItemProps {
  label: string;
  icon?: LucideIcon | React.ReactNode;
  shortcut?: string;
  destructive?: boolean;
  disabled?: boolean;
  onClick: () => void;
}

export interface ContextMenuSeparator {
  type: "separator";
}

export type ContextMenuEntry = ContextMenuItemProps | ContextMenuSeparator;

interface ContextMenuProps {
  children: React.ReactNode;
  items: ContextMenuEntry[];
  className?: string;
}

export default function ContextMenu({ children, items, className }: ContextMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const menuRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLDivElement>(null);

  const handleContextMenu = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      
      const x = e.clientX;
      const y = e.clientY;
      
      setPosition({ x, y });
      setIsOpen(true);
    },
    []
  );

  const closeMenu = useCallback(() => {
    setIsOpen(false);
  }, []);

  useEffect(() => {
    if (!isOpen) return;

    const handleGlobalClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        closeMenu();
      }
    };

    const handleScroll = () => {
      closeMenu();
    };

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeMenu();
    };

    // Timeout prevents the initial click from instantly triggering close
    setTimeout(() => {
      window.addEventListener("click", handleGlobalClick);
      window.addEventListener("contextmenu", handleGlobalClick);
      window.addEventListener("scroll", handleScroll, true);
      window.addEventListener("keydown", handleEscape);
    }, 10);

    return () => {
      window.removeEventListener("click", handleGlobalClick);
      window.removeEventListener("contextmenu", handleGlobalClick);
      window.removeEventListener("scroll", handleScroll, true);
      window.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen, closeMenu]);

  useEffect(() => {
    if (isOpen && menuRef.current) {
      const rect = menuRef.current.getBoundingClientRect();
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;

      let newX = position.x;
      let newY = position.y;

      if (position.x + rect.width > viewportWidth - 8) {
        newX = viewportWidth - rect.width - 8;
      }
      if (position.y + rect.height > viewportHeight - 8) {
        newY = viewportHeight - rect.height - 8;
      }

      if (newX !== position.x || newY !== position.y) {
        setPosition({ x: newX, y: newY });
      }
    }
  }, [isOpen, position.x, position.y]);

  const menuEl = (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          ref={menuRef}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.1, ease: "easeOut" }}
          style={{ top: position.y, left: position.x }}
          className="fixed z-[100] min-w-[220px] py-1.5 bg-surface/80 dark:bg-surface/70 backdrop-blur-2xl border border-black/10 dark:border-white/10 rounded-xl shadow-[0_8px_30px_rgba(0,0,0,0.2)]"
        >
          {items.map((item, i) => {
            if ("type" in item && item.type === "separator") {
              return <div key={i} className="my-1.5 h-px bg-black/5 dark:bg-white/5 mx-3" />;
            }

            const menuBtn = item as ContextMenuItemProps;
            return (
              <button
                key={i}
                disabled={menuBtn.disabled}
                onClick={(e) => {
                  e.stopPropagation();
                  menuBtn.onClick();
                  closeMenu();
                }}
                className={cn(
                  "w-full flex items-center justify-between px-3 py-1.5 text-sm transition-colors cursor-default select-none group",
                  "hover:bg-accent/10 focus:bg-accent/10 focus:outline-none",
                  menuBtn.disabled && "opacity-50 cursor-not-allowed hover:bg-transparent",
                  menuBtn.destructive
                    ? "text-red-500 hover:text-red-500"
                    : "text-text-main"
                )}
              >
                <div className="flex items-center gap-2.5">
                  {menuBtn.icon && (
                    <span className="shrink-0 flex items-center justify-center size-4">
                      {typeof menuBtn.icon === "function" || typeof menuBtn.icon === "object"
                        ? (
                            typeof menuBtn.icon === "object" ? menuBtn.icon : <menuBtn.icon size={16} />
                          )
                        : (
                            <span className="material-symbols-outlined text-[16px]">{menuBtn.icon as string}</span>
                          )}
                    </span>
                  )}
                  <span className={cn("font-medium", menuBtn.destructive ? "text-red-500" : "")}>{menuBtn.label}</span>
                </div>
                {menuBtn.shortcut && (
                  <span className="text-xs text-text-muted group-hover:text-accent/60 tracking-widest font-sans">
                    {menuBtn.shortcut}
                  </span>
                )}
              </button>
            );
          })}
        </motion.div>
      )}
    </AnimatePresence>
  );

  return (
    <>
      <div ref={triggerRef} onContextMenu={handleContextMenu} className={className}>
        {children}
      </div>
      {typeof window !== "undefined" && createPortal(menuEl, document.body)}
    </>
  );
}

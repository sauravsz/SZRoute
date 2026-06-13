"use client";

import { useEffect, useRef, useId } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { cn } from "@/shared/utils/cn";
import Button from "./Button";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  children?: React.ReactNode;
  footer?: React.ReactNode;
  size?: "sm" | "md" | "lg" | "xl" | "full";
  closeOnOverlay?: boolean;
  showCloseButton?: boolean;
  className?: string;
  bodyClassName?: string;
  compactHeader?: boolean;
  maxWidth?: string;
}

export default function Modal({
  isOpen,
  onClose,
  title,
  children,
  footer,
  size = "md",
  closeOnOverlay = true,
  showCloseButton = true,
  className,
  bodyClassName,
  compactHeader = false,
}: ModalProps) {
  const titleId = useId();
  const dialogRef = useRef(null);

  const sizes = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg",
    xl: "max-w-xl",
    full: "max-w-4xl",
  };

  // Lock body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);

  // Focus trap
  useEffect(() => {
    if (!isOpen || !dialogRef.current) return;

    const dialog = dialogRef.current;
    const focusableSelector =
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';

    // Focus first focusable element
    const firstFocusable = dialog.querySelector(focusableSelector);
    if (firstFocusable) {
      setTimeout(() => firstFocusable.focus(), 50);
    }

    const handleTab = (e) => {
      if (e.key !== "Tab") return;

      const focusable = [...dialog.querySelectorAll(focusableSelector)];
      if (focusable.length === 0) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };

    dialog.addEventListener("keydown", handleTab);
    return () => dialog.removeEventListener("keydown", handleTab);
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="absolute inset-0 bg-black/20 dark:bg-black/40 backdrop-blur-md"
            onClick={closeOnOverlay ? onClose : undefined}
            aria-hidden="true"
          />

      {/* Modal content */}
      <motion.div
        ref={dialogRef as any}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? titleId : undefined}
        initial={{ opacity: 0, scale: 0.95, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 16 }}
        transition={{ type: "spring", stiffness: 450, damping: 35 }}
        className={cn(
          "relative w-full bg-vibrancy",
          "border border-black/10 dark:border-white/10",
          "rounded-[14px] shadow-[0_20px_50px_rgba(0,0,0,0.3)]",
          sizes[size],
          className
        )}
      >
        {/* Header */}
        {(title || showCloseButton) && (
          <div
            className={cn(
              "flex items-center justify-between border-b border-black/5 dark:border-white/5",
              compactHeader ? "px-4 py-2.5" : "p-6"
            )}
          >
            <div className="flex items-center min-w-0">
              <div
                className={cn(
                  "flex items-center gap-1.5 mr-3 shrink-0",
                  compactHeader ? "" : "gap-2 mr-4"
                )}
                aria-hidden="true"
              >
                <div
                  className={cn(
                    "rounded-full bg-[#FF5F56]",
                    compactHeader ? "w-2.5 h-2.5" : "w-3 h-3"
                  )}
                />
                <div
                  className={cn(
                    "rounded-full bg-[#FFBD2E]",
                    compactHeader ? "w-2.5 h-2.5" : "w-3 h-3"
                  )}
                />
                <div
                  className={cn(
                    "rounded-full bg-[#27C93F]",
                    compactHeader ? "w-2.5 h-2.5" : "w-3 h-3"
                  )}
                />
              </div>
              {title && (
                <h2
                  id={titleId}
                  className={cn(
                    "font-semibold text-text-main truncate min-w-0",
                    compactHeader ? "text-sm" : "text-lg"
                  )}
                >
                  {title}
                </h2>
              )}
            </div>
            {showCloseButton && (
              <button
                onClick={onClose}
                aria-label="Close"
                className="p-1.5 rounded-lg text-text-muted hover:bg-black/5 dark:hover:bg-white/5 transition-colors shrink-0"
              >
                <X size={20} />
              </button>
            )}
          </div>
        )}

        {/* Body */}
        <div className={bodyClassName ?? "p-6 max-h-[calc(80vh-140px)] overflow-y-auto"}>
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div className="flex items-center justify-end gap-3 p-6 border-t border-black/5 dark:border-white/5">
            {footer}
          </div>
        )}
      </motion.div>
    </div>
    )}
    </AnimatePresence>
  );
}

// Confirm Modal helper
export function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title = "Confirm",
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  variant = "danger",
  loading = false,
}) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      size="sm"
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={loading}>
            {cancelText}
          </Button>
          <Button variant={variant as any} onClick={onConfirm} loading={loading}>
            {confirmText}
          </Button>
        </>
      }
    >
      <p className="text-text-muted">{message}</p>
    </Modal>
  );
}

import { useState, useEffect } from "react";
import { Icon } from "@iconify/react";

export type AlertVariant = "success" | "error" | "info" | "warning";

interface AlertToastProps {
  message: string;
  variant?: AlertVariant;
  icon?: string;
  duration?: number;
  onClose?: () => void;
  isOpen: boolean;
}

export default function AlertToast({
  message,
  variant = "info",
  icon,
  duration = 5000,
  onClose,
  isOpen,
}: AlertToastProps) {
  const [isVisible, setIsVisible] = useState(false);

  const defaultIcons = {
    success: "mdi:check-circle",
    error: "mdi:alert-circle",
    info: "mdi:information",
    warning: "mdi:alert",
  };

  const variantStyles = {
    success:
      "bg-green-100 text-green-800 border-green-200 dark:bg-green-800/20 dark:text-green-400 dark:border-green-800",
    error:
      "bg-red-100 text-red-800 border-red-200 dark:bg-red-800/20 dark:text-red-400 dark:border-red-800",
    info: "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-800/20 dark:text-blue-400 dark:border-blue-800",
    warning:
      "bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-800/20 dark:text-yellow-400 dark:border-yellow-800",
  };

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
      const timer = setTimeout(() => {
        setIsVisible(false);
        if (onClose) setTimeout(onClose, 300);
      }, duration);

      return () => clearTimeout(timer);
    } else {
      setIsVisible(false);
    }
  }, [isOpen, duration, onClose]);

  const handleClose = () => {
    setIsVisible(false);
    if (onClose) setTimeout(onClose, 300);
  };

  return (
    <div
      className={`fixed right-4 bottom-4 z-50 flex transform items-center transition-all duration-300 ${
        isVisible
          ? "translate-y-0 opacity-100 backdrop-blur-md"
          : "pointer-events-none translate-y-10 opacity-0"
      }`}
      role="alert"
      aria-live="assertive"
    >
      <div
        className={`flex max-w-xs items-center justify-between gap-3 rounded-lg border p-4 shadow-lg ${
          variantStyles[variant]
        }`}
      >
        <div className="flex items-center gap-3">
          <Icon
            icon={icon || defaultIcons[variant]}
            className="h-5 w-5 flex-shrink-0"
          />
          <p className="text-sm font-medium">{message}</p>
        </div>
        <button
          type="button"
          className="ml-3 flex-shrink-0 rounded p-1 hover:bg-black/5 focus:ring-2 focus:ring-black/10 focus:outline-none dark:hover:bg-white/5 dark:focus:ring-white/10"
          onClick={handleClose}
          aria-label="Close"
        >
          <Icon icon="mdi:close" className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

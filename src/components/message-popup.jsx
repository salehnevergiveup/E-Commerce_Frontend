import React, { useState, useEffect } from "react";
import { AlertCircle, X, CheckCircle, Info } from "lucide-react";
import { cva } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { ShoppingBag } from "lucide-react"; // Ensure this import is present

const popupVariants = cva(
  "fixed z-50 top-4 right-4 p-2 rounded-lg shadow-lg flex items-center space-x-3 transition-all duration-300 ease-in-out",
  {
    variants: {
      variant: {
        error: "border-b-2 border-red-500",
        success: "border-b-2 border-green-500",
        warning: "border-b-2 border-yellow-500",
        info: "border-b-2 border-blue-500",
      },
    },
    defaultVariants: {
      variant: "info",
    },
  }
);

export const MessagePopup = ({ message, variant, duration = 5000, onClose }) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      onClose?.();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  if (!isVisible) return null;

  const Icon = {
    error: AlertCircle,
    success: CheckCircle,
    warning: AlertCircle,
    info: Info,
  }[variant || "info"];

  return (
    <div
      role="alert"
      aria-live="assertive"
      className={cn(popupVariants({ variant }), "bg-white rounded-lg")}
    >
      <div className="flex-shrink-0">
        <ShoppingBag className="h-5 w-5 text-orange-500" /> 
      </div>
      <Icon className="w-4 h-4 flex-shrink-0" />
      <span className="flex-grow">{message}</span>
      <button
        onClick={() => {
          setIsVisible(false);
          onClose?.();
        }}
        className="text-current hover:text-gray-600 transition-colors"
        aria-label="Close"
      >
        <X className="w-5 h-5" />
      </button>
    </div>
  );
};

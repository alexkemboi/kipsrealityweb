"use client";

import { useEffect, useState } from "react";
import { Check, X } from "lucide-react";

interface CustomToastProps {
  message: string;
  type?: "success" | "error";
  duration?: number;
  onClose: () => void;
}

export function showCustomToast(message: string, type: "success" | "error" = "success", duration = 3000) {
  const event = new CustomEvent("show-custom-toast", {
    detail: { message, type, duration },
  });
  window.dispatchEvent(event);
}

export function CustomToast({ message, type = "success", duration = 3000, onClose }: CustomToastProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    // Check for dark mode
    const checkDarkMode = () => {
      setIsDark(document.documentElement.classList.contains("dark"));
    };
    checkDarkMode();

    const observer = new MutationObserver(checkDarkMode);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    // Trigger animation
    setTimeout(() => setIsVisible(true), 100);

    // Auto dismiss
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onClose, 300);
    }, duration);

    return () => {
      observer.disconnect();
      clearTimeout(timer);
    };
  }, [duration, onClose]);

  return (
    <>
      <style dangerouslySetInnerHTML={{
        __html: `
          @keyframes bounce-subtle {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-5px); }
          }
          .animate-bounce-subtle {
            animation: bounce-subtle 2s infinite ease-in-out;
          }
        `
      }} />
      <div
        className={`fixed bottom-10 left-0 right-0 px-6 flex justify-center z-50 transition-all duration-300 ${
          isVisible ? "translate-y-0 opacity-100 animate-bounce-subtle" : "translate-y-4 opacity-0"
        }`}
      >
        <div
          className={`bg-gray-900/90 dark:bg-white/95 backdrop-blur-md px-6 py-3 rounded-full flex items-center shadow-2xl border ${
            isDark ? "border-white/10" : "border-gray-200"
          }`}
        >
          <div
            className={`w-6 h-6 rounded-full flex items-center justify-center mr-3 ${
              type === "success" ? "bg-green-500" : "bg-red-500"
            }`}
          >
            {type === "success" ? (
              <Check className="text-white" style={{ fontSize: 16 }} />
            ) : (
              <X className="text-white" style={{ fontSize: 16 }} />
            )}
          </div>
          <span
            className={`text-sm font-medium ${
              isDark ? "text-white" : "text-gray-900"
            }`}
          >
            {message}
          </span>
        </div>
      </div>
    </>
  );
}

// Toast container component
export function ToastContainer() {
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
    duration: number;
  } | null>(null);

  useEffect(() => {
    const handleShowToast = (e: CustomEvent) => {
      setToast(e.detail);
    };

    window.addEventListener("show-custom-toast" as any, handleShowToast);
    return () => {
      window.removeEventListener("show-custom-toast" as any, handleShowToast);
    };
  }, []);

  if (!toast) return null;

  return (
    <CustomToast
      message={toast.message}
      type={toast.type}
      duration={toast.duration}
      onClose={() => setToast(null)}
    />
  );
}

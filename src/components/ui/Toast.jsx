import { createContext, useContext, useState, useCallback, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { X, CheckCircle, AlertCircle, AlertTriangle, Info } from "lucide-react";

const ToastContext = createContext(null);

const typeConfig = {
  success: {
    icon: CheckCircle,
    bg: "bg-success/10 border-success/30",
    iconColor: "text-success",
  },
  error: {
    icon: AlertCircle,
    bg: "bg-danger/10 border-danger/30",
    iconColor: "text-danger",
  },
  warning: {
    icon: AlertTriangle,
    bg: "bg-warning/10 border-warning/30",
    iconColor: "text-warning",
  },
  info: {
    icon: Info,
    bg: "bg-info/10 border-info/30",
    iconColor: "text-info",
  },
};

let toastId = 0;

function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = "info", duration = 4000) => {
    const id = ++toastId;
    setToasts((prev) => [...prev, { id, message, type, duration }]);
    if (duration > 0) {
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, duration);
    }
    return id;
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ addToast, removeToast }}>
      {children}
      {createPortal(
        <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2 pointer-events-none">
          <AnimatePresence>
            {toasts.map((toast) => {
              const config = typeConfig[toast.type] || typeConfig.info;
              const IconComp = config.icon;
              return (
                <motion.div
                  key={toast.id}
                  initial={{ opacity: 0, x: 80, scale: 0.95 }}
                  animate={{ opacity: 1, x: 0, scale: 1 }}
                  exit={{ opacity: 0, x: 80, scale: 0.95 }}
                  transition={{ type: "spring", damping: 20, stiffness: 300 }}
                  className={`
                    pointer-events-auto flex items-start gap-3
                    w-80 rounded-xl border p-4 shadow-lg bg-white
                    ${config.bg}
                  `}
                >
                  <IconComp size={18} className={`${config.iconColor} mt-0.5 shrink-0`} />
                  <p className="text-sm text-text-primary flex-1">{toast.message}</p>
                  <button
                    onClick={() => removeToast(toast.id)}
                    className="p-0.5 rounded text-text-secondary hover:text-text-primary transition-colors cursor-pointer shrink-0"
                  >
                    <X size={14} />
                  </button>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>,
        document.body
      )}
    </ToastContext.Provider>
  );
}

function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within a ToastProvider");
  return {
    toast: ctx.addToast,
    success: (msg, dur) => ctx.addToast(msg, "success", dur),
    error: (msg, dur) => ctx.addToast(msg, "error", dur),
    warning: (msg, dur) => ctx.addToast(msg, "warning", dur),
    info: (msg, dur) => ctx.addToast(msg, "info", dur),
    dismiss: ctx.removeToast,
  };
}

export { ToastProvider, useToast };
export default ToastProvider;

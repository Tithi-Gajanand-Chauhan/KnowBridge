import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';

const ToastContext = createContext(null);

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback(({ title, message, type = 'info', duration = 4000 }) => {
    const id = `toast_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const newToast = { id, title, message, type };

    setToasts((prev) => [...prev, newToast]);

    if (duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }
  }, [removeToast]);

  const toast = {
    success: (title, message) => addToast({ title, message, type: 'success' }),
    error: (title, message) => addToast({ title, message, type: 'error' }),
    info: (title, message) => addToast({ title, message, type: 'info' }),
    warning: (title, message) => addToast({ title, message, type: 'warning' }),
  };

  return (
    <ToastContext.Provider value={{ toast, addToast, removeToast }}>
      {children}
      {/* Toast Render Container */}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col space-y-2.5 max-w-sm w-full pointer-events-none">
        {toasts.map((t) => {
          const config = {
            success: {
              icon: CheckCircle2,
              iconColor: 'text-emerald-600',
              bg: 'bg-white',
              border: 'border-emerald-200',
              accent: 'bg-emerald-500',
            },
            error: {
              icon: AlertCircle,
              iconColor: 'text-rose-600',
              bg: 'bg-white',
              border: 'border-rose-200',
              accent: 'bg-rose-500',
            },
            warning: {
              icon: AlertTriangle,
              iconColor: 'text-amber-600',
              bg: 'bg-white',
              border: 'border-amber-200',
              accent: 'bg-amber-500',
            },
            info: {
              icon: Info,
              iconColor: 'text-brand-600',
              bg: 'bg-white',
              border: 'border-slate-200',
              accent: 'bg-brand-500',
            },
          }[t.type] || {
            icon: Info,
            iconColor: 'text-slate-600',
            bg: 'bg-white',
            border: 'border-slate-200',
            accent: 'bg-slate-400',
          };

          const IconComponent = config.icon;

          return (
            <div
              key={t.id}
              className={`pointer-events-auto flex items-start gap-3 p-4 rounded-xl border shadow-dropdown ${config.bg} ${config.border} transition-all duration-300 animate-slide-up`}
            >
              <div className={`mt-0.5 p-1 rounded-full ${config.iconColor} bg-slate-50 flex-shrink-0`}>
                <IconComponent className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0 pr-1">
                {t.title && <h4 className="text-sm font-semibold text-slate-900 leading-tight">{t.title}</h4>}
                {t.message && <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">{t.message}</p>}
              </div>
              <button
                onClick={() => removeToast(t.id)}
                className="text-slate-400 hover:text-slate-600 p-0.5 rounded-md hover:bg-slate-100 transition-colors"
                aria-label="Dismiss toast"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context.toast;
};

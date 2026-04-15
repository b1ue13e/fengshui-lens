"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect } from "react";

import { useAppStore } from "@/lib/store/app-store";

export function FloatingToast() {
  const toast = useAppStore((state) => state.toast);
  const clearToast = useAppStore((state) => state.clearToast);

  useEffect(() => {
    if (!toast) {
      return;
    }

    const timer = window.setTimeout(() => clearToast(), 2200);
    return () => window.clearTimeout(timer);
  }, [clearToast, toast]);

  return (
    <AnimatePresence>
      {toast ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 16 }}
          className="pointer-events-none fixed inset-x-4 bottom-24 z-50 mx-auto max-w-sm rounded-[1.4rem] border border-white/60 bg-background/95 px-4 py-3 shadow-[0_20px_40px_rgba(36,41,33,0.18)] backdrop-blur-xl"
        >
          <p className="text-sm font-medium text-foreground">{toast.title}</p>
          {toast.description ? (
            <p className="mt-1 text-xs leading-5 text-muted-foreground">{toast.description}</p>
          ) : null}
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

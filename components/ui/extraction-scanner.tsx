"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

const PHASES = [
  "正在接入房源页面…",
  "识别标题、面积与朝向…",
  "转换为评估输入…",
  "生成风险结论与建议…",
];

interface ExtractionScannerProps {
  isScanning: boolean;
  onComplete?: () => void;
}

export function ExtractionScanner({ isScanning, onComplete }: ExtractionScannerProps) {
  const [currentPhase, setCurrentPhase] = useState(0);
  const displayedPhase = isScanning ? currentPhase : 0;

  useEffect(() => {
    if (!isScanning) {
      return;
    }

    const interval = setInterval(() => {
      setCurrentPhase((prev) => {
        const next = prev < PHASES.length - 1 ? prev + 1 : prev;
        if (next === PHASES.length - 1 && onComplete) {
          setTimeout(onComplete, 1500);
        }
        return next;
      });
    }, 1800);

    return () => clearInterval(interval);
  }, [isScanning, onComplete]);

  return (
    <AnimatePresence>
      {isScanning && (
        <motion.div
          initial={{ opacity: 0, backdropFilter: "blur(0px)" }}
          animate={{ opacity: 1, backdropFilter: "blur(12px)" }}
          exit={{ opacity: 0, backdropFilter: "blur(0px)" }}
          transition={{ duration: 0.5 }}
          className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[rgba(242,236,229,0.82)]"
        >
          <div className="relative flex h-64 w-64 items-center justify-center">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 16, ease: "linear" }}
              className="absolute inset-0 rounded-full border border-stone-400/40"
            />

            <motion.div
              animate={{ rotate: -360 }}
              transition={{ repeat: Infinity, duration: 12, ease: "linear" }}
              className="absolute inset-5 rounded-full border border-stone-500/20"
            />

            <motion.div
              animate={{ scale: [1, 1.08, 1], opacity: [0.35, 0.6, 0.35] }}
              transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
              className="absolute inset-8 rounded-full bg-[rgba(88,116,97,0.10)]"
            />

            <motion.div
              animate={{ rotate: [0, 180, 360] }}
              transition={{ repeat: Infinity, duration: 6, ease: "linear" }}
              className="absolute h-52 w-52 rounded-full border-t border-[rgba(88,116,97,0.8)]"
            />

            <div className="relative text-center">
              <motion.div
                animate={{
                  textShadow: [
                    "0 8px 18px rgba(62,79,68,0.12)",
                    "0 16px 28px rgba(62,79,68,0.2)",
                    "0 8px 18px rgba(62,79,68,0.12)",
                  ],
                }}
                transition={{ repeat: Infinity, duration: 2.2 }}
                className="text-4xl font-semibold tracking-[0.22em] text-stone-900"
              >
                SCAN
              </motion.div>
              <motion.div
                animate={{ opacity: [0.3, 1, 0.3] }}
                transition={{ repeat: Infinity, duration: 1.4 }}
                className="mt-2 text-xs uppercase tracking-[0.28em] text-stone-500"
              >
                Rental Tool Inspect
              </motion.div>
            </div>
          </div>

          <div className="mt-12 h-20 text-center">
            <AnimatePresence mode="wait">
              <motion.p
                key={displayedPhase}
                initial={{ opacity: 0, y: 10, filter: "blur(4px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                exit={{ opacity: 0, y: -10, filter: "blur(4px)" }}
                transition={{ duration: 0.4 }}
                className="text-lg tracking-[0.08em] text-stone-800"
              >
                {PHASES[displayedPhase]}
              </motion.p>
            </AnimatePresence>

            <div className="mt-3 flex justify-center gap-2">
              {PHASES.map((_, idx) => (
                <motion.div
                  key={idx}
                  className="h-1.5 w-8 rounded-full"
                  animate={{
                    backgroundColor: idx <= displayedPhase ? "#556b5a" : "#cfc5b8",
                    scale: idx === displayedPhase ? 1.2 : 1,
                  }}
                  transition={{ duration: 0.3 }}
                />
              ))}
            </div>

            <div className="mt-6 h-1.5 w-72 overflow-hidden rounded-full bg-stone-300/70">
              <motion.div
                className="h-full bg-stone-800"
                initial={{ width: "0%" }}
                animate={{ width: `${((displayedPhase + 1) / PHASES.length) * 100}%` }}
                transition={{ duration: 0.5, ease: "circOut" }}
              />
            </div>

            <motion.div
              className="mt-2 text-sm text-stone-500"
              key={displayedPhase}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              {Math.round(((displayedPhase + 1) / PHASES.length) * 100)}%
            </motion.div>
          </div>

          <motion.div
            className="absolute bottom-12 left-1/2 -translate-x-1/2 text-xs uppercase tracking-[0.22em] text-stone-400"
            animate={{ opacity: [0.3, 0.7, 0.3] }}
            transition={{ repeat: Infinity, duration: 3 }}
          >
            Rental Tool Scanner v1.2.0
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export function ScanButton({
  onClick,
  isLoading,
  children,
}: {
  onClick: () => void;
  isLoading?: boolean;
  children: React.ReactNode;
}) {
  return (
    <motion.button
      onClick={onClick}
      disabled={isLoading}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className="group relative inline-flex items-center justify-center gap-2 overflow-hidden rounded-full bg-stone-900 px-8 py-4 font-semibold text-stone-50 transition-all hover:bg-stone-800 hover:shadow-[0_18px_40px_rgba(45,49,45,0.22)] disabled:opacity-50"
    >
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
        animate={{ x: ["-100%", "200%"] }}
        transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
      />

      <span className="relative z-10 flex items-center gap-2">
        {isLoading ? (
          <>
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
              className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full"
            />
            扫描中...
          </>
        ) : (
          children
        )}
      </span>
    </motion.button>
  );
}

"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import LoginCard from "@/components/LoginCard";
import BrandMark from "@/components/BrandMark";
import { notFound } from "next/navigation";

const splashVariants = {
  hidden: { opacity: 0, y: -24 },
  visible: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -24 },
};

const cardGroup = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0 },
};

const fadeUp = {
  hidden: { opacity: 0, y: 8 },
  visible: { opacity: 1, y: 0 },
};

/* --------------------------------- Splash -------------------------------- */
function Splash({ visible }) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="absolute inset-0 flex items-center justify-center"
          variants={splashVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          transition={{ duration: 0.4, ease: "easeOut" }}
          aria-hidden={!visible}
        >
          <div className="flex flex-col items-center gap-3 text-zinc-800 dark:text-zinc-100">
            <BrandMark />
            <h1 className="text-lg font-semibold tracking-tight">ยินดีต้อนรับสู่ระบบ</h1>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">Medical Record Audit</p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default function LoginPage() {
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    const profile = JSON.parse(localStorage.getItem("profile"));
    if (profile) {
      return notFound();
    }
  }, [])

  useEffect(() => {
    const t = setTimeout(() => setShowSplash(false), 1200);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="min-h-dvh">
      <div className="mx-auto flex h-dvh max-w-6xl items-center justify-center px-4">
        <div className="relative w-full max-w-md">
          {/* Splash */}
          <Splash visible={showSplash} />

          {/* Card group */}
          <AnimatePresence initial={false}>
            {!showSplash && (
              <motion.div
                key="card"
                variants={cardGroup}
                initial="hidden"
                animate="visible"
                exit="hidden"
                transition={{ duration: 0.4, ease: "easeOut" }}
              >
                <LoginCard animated={fadeUp} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
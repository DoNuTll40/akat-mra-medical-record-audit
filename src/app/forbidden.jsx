// app/(public)/forbidden/page.tsx
"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { ShieldAlert, ArrowLeft, Home, LogIn } from "lucide-react";
import { usePathname } from "next/navigation";

export default function Forbidden() {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const back = () => {
    if (window.history.length > 1) window.history.back();
  };

  return (
    <div className="w-full flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 8, scale: 0.98 }}
        animate={{ opacity: mounted ? 1 : 0, y: 0, scale: 1 }}
        transition={{ duration: 0.2 }}
        className="w-full max-w-3xl rounded-2xl border border-zinc-800/40 bg-zinc-900/40 p-6 shadow-xl
                   backdrop-blur dark:bg-zinc-900/40 dark:border-zinc-700/40
                   text-zinc-200"
      >
        {/* Header */}
        <div className="flex items-start gap-3">
          <div className="rounded-xl bg-red-500/10 p-2.5 ring-1 ring-inset ring-red-500/30">
            <ShieldAlert className="size-6 text-red-400" />
          </div>
          <div className="flex-1">
            <h1 className="text-xl font-extrabold tracking-tight">
              ไม่มีสิทธิ์เข้าถึง (403)
            </h1>
            <p className="mt-1 text-sm text-zinc-400">
              คุณไม่ได้รับอนุญาตให้เข้าถึงทรัพยากรนี้ โปรดตรวจสอบสิทธิ์การใช้งานกับผู้ดูแลระบบ
            </p>
          </div>
        </div>

        {/* Details */}
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <div className="rounded-xl border border-zinc-800/50 bg-zinc-900/30 p-4">
            <p className="text-sm font-semibold text-zinc-300 mb-2">ตัวเลือกที่แนะนำ</p>
            <ol className="space-y-2 text-sm text-zinc-400">
              <li className="flex items-center gap-2">
                <kbd className="px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-200 text-xs border border-zinc-700">Alt</kbd>
                <span className="text-zinc-500">+</span>
                <kbd className="px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-200 text-xs border border-zinc-700">←</kbd>
                <span className="ml-2">กลับหน้าก่อนหน้า</span>
              </li>
              <li className="flex items-center gap-2">
                <kbd className="px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-200 text-xs border border-zinc-700">Ctrl</kbd>
                <span className="text-zinc-500">+</span>
                <kbd className="px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-200 text-xs border border-zinc-700">R</kbd>
                <span className="ml-2">รีเฟรชและลองใหม่</span>
              </li>
            </ol>
          </div>

          <div className="rounded-xl border border-zinc-800/50 bg-zinc-900/30 p-4">
            <p className="text-sm font-semibold text-zinc-300 mb-2">ข้อมูลเพิ่มเติม</p>
            <div className="text-sm text-zinc-400">
              <div className="flex items-center justify-between">
                <span className="text-zinc-500">URL</span>
                <span className="truncate max-w-[60%] text-zinc-300">{pathname}</span>
              </div>
              <div className="mt-1 flex items-center justify-between">
                <span className="text-zinc-500">สถานะ</span>
                <span className="text-zinc-300">403 Forbidden</span>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-6 flex flex-wrap gap-3">
          <button
            onClick={back}
            className="inline-flex items-center gap-2 rounded-lg bg-zinc-200 px-4 py-2 font-semibold text-zinc-900
                       hover:bg-zinc-100 active:scale-[0.98] transition
                       dark:bg-zinc-800 dark:text-zinc-100 dark:hover:bg-zinc-700"
          >
            <ArrowLeft className="size-4" />
            กลับหน้าก่อนหน้า
          </button>

          <Link
            href="/mra" // เปลี่ยนให้เป็น dashboard จริงของนาย
            className="inline-flex items-center gap-2 rounded-lg bg-emerald-500 px-4 py-2 font-semibold text-white
                       hover:bg-emerald-400 active:scale-[0.98] transition"
          >
            <Home className="size-4" />
            ไปหน้า Dashboard
          </Link>

          <Link
            href="/auth/login" // เปลี่ยนให้เป็น path login ของนาย
            className="inline-flex items-center gap-2 rounded-lg border border-zinc-700 px-4 py-2 font-semibold
                       text-zinc-200 hover:bg-zinc-800/60 active:scale-[0.98] transition"
          >
            <LogIn className="size-4" />
            เข้าสู่ระบบ
          </Link>
        </div>
      </motion.div>
    </div>
  );
}

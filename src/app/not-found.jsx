// app/not-found.tsx
"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { TriangleAlert, Home, ArrowLeft, Bug } from "lucide-react";
import Ripple from "material-ripple-effects";

const HOSPITAL = process.env.NEXT_PUBLIC_HOSPITAL_NAME ?? "—";
const HCODE = process.env.NEXT_PUBLIC_HOSPITAL_CODE ?? "—";

export default function NotFound() {

  const ripple = new Ripple();
  const router = useRouter();

  return (
    <main className="h-dvh w-full px-4 py-16 flex items-center justify-center">
      <section className="w-full max-w-3xl mx-auto rounded-2xl border border-black/10 dark:border-zinc-800/60 bg-[#F9F9F9]  dark:bg-zinc-900/60 backdrop-blur p-6 sm:p-8 shadow-smtext-zinc-100">
        
        {/* Header */}
        <header className="flex items-center gap-3">
          <div className="size-11 rounded-xl grid place-items-center bg-red-500/10 text-red-400 border border-red-400/20">
            <TriangleAlert className="size-5" />
          </div>
          <div className="flex-1">
            <h1 className="text-2xl font-semibold tracking-tight">ไม่พบหน้านี้ (404)</h1>
            <p className="mt-1 text-zinc-800 dark:text-zinc-400">
              ลิงก์อาจถูกย้าย หมดอายุ สะกดผิด หรือกำลังพัฒนาอยู่ <Bug className="inline size-4 mb-0.5" />
            </p>
          </div>
          <span className="hidden sm:inline-flex items-center rounded-full px-2.5 py-1 text-xs bg-emerald-500/15 text-emerald-500 border border-emerald-400/50">
            Medical Record Audit
          </span>
        </header>

        {/* Content */}
        <div className="mt-8 grid gap-6 sm:grid-cols-2">
          {/* Left box */}
          <div className="rounded-xl p-5 border border-black/10 dark:border-zinc-800/60 bg-[#e3e3e3] dark:bg-zinc-900">
            <h2 className="font-medium mb-2">ตัวเลือกที่แนะนำ</h2>
            <ul className="space-y-3 text-zinc-800 dark:text-zinc-400">
              <li className="flex items-center gap-2">
                <span className="inline-flex size-5 items-center justify-center rounded-md border border-zinc-700 dark:text-zinc-300 text-xs">1</span>
                กลับหน้าก่อนหน้า
                <span className="ml-1 text-zinc-800 dark:text-zinc-400">(กด <Kbd>Alt</Kbd> + <Kbd>←</Kbd>)</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="inline-flex size-5 items-center justify-center rounded-md border border-zinc-700 dark:text-zinc-300 text-xs">2</span>
                ไปหน้าแดชบอร์ดเพื่อเริ่มใหม่
              </li>
            </ul>
          </div>

          {/* Right actions */}
          <div className="rounded-xl p-5 border border-black/10 dark:border-zinc-800/60 bg-[#e3e3e3] dark:bg-zinc-900 flex flex-col gap-3">
            <button
              onClick={() => router.back()}
              onMouseUp={(event) => ripple.create(event, 'dark')}
              className="inline-flex cursor-pointer items-center gap-2 rounded-lg px-3.5 py-2.5 bg-emerald-700 text-white hover:bg-emerald-600 transition">
              <ArrowLeft className="size-4" /> กลับหน้าก่อนหน้า
            </button>

            <Link 
              href="/"
              onMouseUp={(event) => ripple.create(event, 'dark')}
              className="inline-flex items-center gap-2 rounded-lg px-3.5 py-2.5 bg-zinc-800 text-zinc-100 hover:bg-zinc-700 transition">
              <Home className="size-4" /> ไปหน้า Dashboard
            </Link>

            <div className="mt-1 text-sm text-zinc-700 dark:text-zinc-500 break-all">
              URL : {typeof window !== "undefined" ? window.location.href : "-"}
            </div>
          </div>
        </div>

        {/* Footer bar */}
        <footer className="mt-8 pt-2 border-t border-zinc-800/15 dark:border-zinc-800/60 text-sm text-zinc-500 flex items-center justify-between">
          <span>{HOSPITAL} ({HCODE})</span>
          <span className="opacity-70">Copyright &copy; {new Date().getFullYear()} กลุ่มงานสุขภาพดิจิทัล. All rights reserved.</span>
        </footer>
      </section>
    </main>
  );
}

/* ตัวช่วยแทน <Kbd> แบบไม่พึ่ง UI lib */
function Kbd({ children }) {
  return (
    <kbd className="mx-0.5 rounded-md border border-zinc-700 bg-zinc-800 px-1.5 py-0.5 text-xs text-zinc-300">
      {children}
    </kbd>
  );
}

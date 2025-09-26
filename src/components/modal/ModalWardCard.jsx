// ModalWardCard.tsx
"use client";
import { useEffect } from "react";
import { motion } from "framer-motion";
import { Building2, X } from "lucide-react";
import WardCardDetail from "../dashboard/WardCardDetail";
import Ripple from "material-ripple-effects";


export default function ModalWardCard({ title, subtitle, data, onClose }) {
    const ripple = new Ripple();
    
    // ปิดด้วย ESC + ล็อกสกรอล
    useEffect(() => {
        const onKey = (e) => e.key === "Escape" && onClose();
        window.addEventListener("keydown", onKey);
        const prev = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        return () => {
            window.removeEventListener("keydown", onKey);
            document.body.style.overflow = prev;
        };
    }, [onClose]);

    return (
        <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-[2px] p-4"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
        >
            <motion.div
                onClick={(e) => e.stopPropagation()} // ปิดด้วยคลิกด้านนอก
                className="relative w-full max-w-2xl rounded-2xl bg-white dark:bg-[#1f1f1f] shadow-2xl ring-1 ring-black/5"
                initial={{ opacity: 0, scale: 0.9, y: 12 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.96, y: 8 }}
                transition={{ type: "spring", stiffness: 260, damping: 22 }}
            >

                {/* Header */}
                <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-700 px-4 py-2">
                    <div>
                        <p className="font-semibold">{title}</p>
                        <p className="font-bold text-xs text-zinc-600 flex items-center gap-1"><Building2 size={14} />{subtitle}</p>
                    </div>
                    <motion.button
                        onClick={onClose}
                        onMouseDown={(e) => ripple.create(e)}
                        className="cursor-pointer inline-flex h-8 w-8 items-center justify-center rounded-full hover:bg-black/5 dark:hover:bg-white/10"
                        aria-label="Close"
                    >
                        <X size={18} />
                    </motion.button>
                </div>

                {/* Body */}
                <div className="px-4 py-2 overflow-y-auto max-h-[calc(100vh-40vh)]">
                    {/* {JSON.stringify(data, null, 2)} */}
                    {data.map((e) => (
                        <WardCardDetail data={e} />
                    ))}
                </div>

                {/* Footer */}
                <div className="text-xs text-zinc-400 flex items-center justify-end border-t border-zinc-200 dark:border-zinc-700 px-4 py-3">
                    <p>กลุ่มงานสุขภาพดิจิทัล โรงพยาบาลอากาศอำนวย</p>
                </div>
            </motion.div>
        </motion.div>
    );
}
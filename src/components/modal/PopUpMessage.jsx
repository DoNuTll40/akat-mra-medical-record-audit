"use client";

import React from "react";
import { ShieldAlert, X } from "lucide-react";
import { motion } from "framer-motion";
import Ripple from "material-ripple-effects";

export default function PopUpMessage({ type = "error", title = "เกิดข้อผิดพลาด", message = "เกิดข้อผิดพลาด", onClose }) {
  
  const ripple = new Ripple();

  const colors = {
    error: "bg-rose-600 text-white",
    success: "bg-emerald-600 text-white",
    info: "bg-blue-600 text-white",
    warning: "bg-yellow-600 text-black",
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fixed inset-0 flex items-center justify-center z-50 bg-black/40 backdrop-blur-xs">
      <motion.div initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} className="max-w-sm rounded-2xl w-full shadow-lg overflow-hidden">
        <div className="bg-white dark:bg-[#1f1f1f]">
          <div className={`flex items-center justify-between p-3 select-none`}>
            <span className={`font-semibold text-sm rounded-full px-4 py-1.5 flex gap-1 items-center ${colors[type]}`}><ShieldAlert size={18} /> {title}</span>
            <motion.button 
              whileTap={{ scale: 0.98 }}
              onMouseUp={(e) => ripple.create(e)}
              onClick={onClose} 
              className="ml-2 text-zinc-400 rounded-full p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 transition cursor-pointer"
            >
              <X size={16} />
            </motion.button>
          </div>
          <div className="pt-1 pb-4 px-4">
            <p>{message}</p>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

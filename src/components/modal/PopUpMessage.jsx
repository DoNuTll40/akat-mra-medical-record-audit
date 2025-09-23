"use client";

import React from "react";
import { XCircle } from "lucide-react";

export default function PopUpMessage({ 
  type = "error",      // "error" | "success" | "info" | "warning"
  message = "เกิดข้อผิดพลาด", 
  onClose 
}) {
  const colors = {
    error: "bg-red-500 text-white",
    success: "bg-green-500 text-white",
    info: "bg-blue-500 text-white",
    warning: "bg-yellow-400 text-black",
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/50">
      <div className="max-w-md rounded-xl shadow-lg overflow-hidden">
        <div className={`flex items-center justify-between py-2 pr-2 ${colors[type]}`}>
          <span className="font-semibold pl-3">| {type.toUpperCase()}</span>
          <button 
            onClick={onClose} 
            className="ml-2 rounded-full hover:scale-110 transition"
          >
            <XCircle size={22} />
          </button>
        </div>
        <div className="bg-white dark:bg-[#1f1f1f] px-5 py-6 text-center">
          <p className="text-base font-medium text-gray-800 dark:text-gray-200">
            {message}
          </p>
        </div>
      </div>
    </div>
  );
}

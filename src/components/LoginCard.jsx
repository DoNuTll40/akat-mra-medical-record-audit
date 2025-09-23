"use client"

import { useRef, useState } from "react";
import Card from "./Card";
import ModalVerifyOtp from "./modal/ModalVerifyOtp";
import { motion } from "framer-motion";
import TextInput from "./TextInput";
import BrandMark from "./BrandMark";
import Ripple from "material-ripple-effects";
import axiosApi from "@/config/axios-api";
import { addToast, getToastQueue, Toast, useToast } from "@heroui/toast";
import { Info } from "lucide-react";
import PopUpMessage from "./modal/PopUpMessage";

export default function LoginCard({ animated }) {
  const [showPass, setShowPass] = useState(false);
  const [token, setToken] = useState("");
  const [input, setInput] = useState({ username: "", password: "" });
  const [showModalOtp, setShowModalOtp] = useState(false);
  const [loading, setLoading] = useState(false);
  const formRef = useRef(null);

  const [showModalPopUpMessage, setShowModalPopUpMessage] = useState(false);

  const ripple = new Ripple();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const res = await axiosApi.post("/auth/login", {
        username: input.username,
        password: input.password,
      })

      if (res.status === 200) {
        setToken(res.data.token);
        localStorage.setItem("token", res.data.token);
        setShowModalOtp(true);
      };
    } catch (err) {
      setShowModalPopUpMessage(true);
      addToast({
        title: "เกิดข้อผิดพลาด",
        description: err.response.data.message,
        timeout: 5000,
        color: "danger",
        shouldShowTimeoutProgress: true,
      })
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card>
      { showModalPopUpMessage && <PopUpMessage title="การเชื่อมต่อช้า" type="error" message="ระบบเกิดข้อผิดพลาดอยู่ในขณะนี้…" onClose={() => setShowModalPopUpMessage(false)} /> }
      <ModalVerifyOtp open={showModalOtp} onClose={() => setShowModalOtp(false)} token={token} />
      <motion.div initial="hidden" animate="visible" transition={{ staggerChildren: 0.25, delayChildren: 0.15 }}>
        {/* Header */}
        <motion.div className="flex flex-col items-center gap-3 px-6 pt-6 text-zinc-800 dark:text-zinc-100" variants={animated.fadeUp}>
          <BrandMark />
          <div className="text-center">
            <h2 className="text-lg font-semibold">Medical Record Audit</h2>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
              โรงพยาบาลอากาศอำนวย <span className="text-zinc-400 dark:text-zinc-500">(11098)</span>
            </p>
          </div>
        </motion.div>

        {/* Form */}
        <motion.form ref={formRef} className="px-6 pb-6 pt-4" onSubmit={handleSubmit} variants={animated.fadeUp}>
          <label htmlFor="username" className="mb-2 block text-sm text-zinc-700 dark:text-zinc-200">
            ชื่อผู้ใช้
          </label>
          <TextInput id="username" name="username" autoComplete="username" placeholder="เช่น staff001" onChange={e => setInput({ ...input, username: e.target.value })} required />

          <label htmlFor="password" className="mb-2 mt-4 block text-sm text-zinc-700 dark:text-zinc-200">
            รหัสผ่าน
          </label>
          <TextInput
            id="password"
            name="password"
            type={showPass ? "text" : "password"}
            autoComplete="current-password"
            placeholder="••••••••"
            onChange={e => setInput({ ...input, password: e.target.value })}
            required
          />

          {/* แสดงรหัสผ่าน + ไมโครแอนิเมชัน */}
          <motion.button
            type="button"
            onClick={() => setShowPass(v => !v)}
            className="mt-3 inline-flex items-center gap-2 text-sm text-zinc-700 dark:text-zinc-200 select-none cursor-pointer"
            whileTap={{ scale: 0.98 }}
          >
            <span
              className={[
                "grid place-items-center size-5 rounded-full border",
                showPass
                  ? "bg-sky-500 border-sky-500"
                  : "border-zinc-400 dark:border-zinc-600 bg-transparent",
              ].join(" ")}
            >
              <motion.svg
                viewBox="0 0 24 24"
                className="w-3.5 h-3.5 text-white"
                initial={false}
                animate={{ scale: showPass ? 1 : 0, opacity: showPass ? 1 : 0 }}
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
              >
                <path
                  d="M5 13l4 4L19 7"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </motion.svg>
            </span>
            แสดงรหัสผ่าน
          </motion.button>

          {/* ปุ่ม */}
          <motion.button
            type="submit"
            onMouseUp={e => ripple.create(e)}
            className={[
              "relative mt-5 w-full rounded-lg px-4 py-2.5 text-sm font-bold cursor-pointer select-none",
              "bg-zinc-300 hover:bg-zinc-200",
              "dark:bg-zinc-800 dark:hover:bg-zinc-700",
              "disabled:opacity-50 disabled:cursor-not-allowed",
            ].join(" ")}
            whileTap={{ scale: 0.99 }}
            disabled={loading}
          >
            {loading ? "กำลังเข้าสู่ระบบ" : "เข้าสู่ระบบ"}
          </motion.button>

          <motion.div className="mt-3 text-center" variants={animated.fadeUp}>
            <span className="text-[10px] text-zinc-500 dark:text-zinc-400">
              กลุ่มงานสุขภาพดิจิทัล • การเชื่อมต่อถูกเข้ารหัส
            </span>
          </motion.div>
        </motion.form>
      </motion.div>
    </Card>
  );
}
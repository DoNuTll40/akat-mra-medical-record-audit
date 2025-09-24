import axiosApi from "@/config/axios-api";
import AuthenHook from "@/hooks/AuthenHook.mjs";
import { Alert } from "@heroui/alert";
import { InputOtp } from "@heroui/input-otp";
import { addToast } from "@heroui/toast";
import { AnimatePresence, motion } from "framer-motion";
import moment from "moment/moment";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function ModalVerifyOtp({ open, onClose, onVerify,  onResend, token }) {
  const { verifyToken } = AuthenHook();
  const [code, setCode] = useState("");
  const [alertMessage, setAlertMessage] = useState("");
  const [sec, setSec] = useState(300); // 5 นาที
  const [loading, setLoading] = useState(false);
  const canSubmit = code.length === 6 && !loading;

  const router = useRouter();

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  // countdown resend
  useEffect(() => {
    if (!open || sec <= 0) return;
    const t = setInterval(() => setSec((s) => s - 1), 1000);
    return () => clearInterval(t);
  }, [open, sec]);

  const submit = async () => {
    setAlertMessage(null);
    if (!canSubmit) return;
    try {
        setLoading(true);
        const res = await axiosApi.post("auth/verifyOtp", {
            otpCode: code,
        }, {
            headers: { Authorization: `Bearer ${token}` }
        })

        if(res.status === 200){
            verifyToken();
            addToast({
              title: "สําเร็จ",
              description: res.data.message,
              timeout: 2500,
              color: "success",
              shouldShowTimeoutProgress: true,
            })
            window.location.assign("/mra");
        }

    } catch (err) {
      setAlertMessage(err.response.data.message);
      setLoading(false);
      setCode("")
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
};

  const doResend = async () => {
    if (sec > 0) return;
    setSec(300);
    await onResend?.();
  };

  const formatTime = (sec) => {
    const dur = moment.duration(sec, "seconds");
    const m = dur.minutes().toString().padStart(1, "0"); // นาที
    const s = dur.seconds().toString().padStart(2, "0"); // วินาที
    return `${m}:${s}`;
 };

 useEffect(() => {
  if(code.length === 6){
    submit();
  }
 }, [code])

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 select-none">
          {/* backdrop */}
          <motion.div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          {/* modal */}
          <motion.div
            className="absolute inset-0 flex items-center justify-center p-4"
            initial={{ opacity: 0, y: 12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.98 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
          >
            <div className="w-full max-w-xs">
              <div className="relative rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#1B1B1D] shadow-xl shadow-black/20">
                {/* header */}
                <div className="px-6 pt-6 pb-2">
                  <div className="flex items-center gap-3">
                    <div className="grid size-9 place-items-center rounded-full bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-300">
                      <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.7">
                        <path d="M12 3l7 4v5c0 5-3.5 9-7 9s-7-4-7-9V7l7-4z" />
                        <path d="M9 12l2 2 4-4" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">ยืนยันรหัส OTP</h3>
                    </div>
                  </div>
                </div>

                {/* body */}
                <div className="px-6 pt-4 pb-2 flex flex-col">
                  {alertMessage && (
                    <Alert color="danger" title={`เกิดข้อผิดพลาด`} description={`หมายเหตุ : ${alertMessage}`} />
                  )}
                  <InputOtp
                    length={6}
                    value={code}
                    onClick={() => setAlertMessage("")}
                    onValueChange={setCode}
                    color={`${alertMessage ? "danger" : ""}`}
                    className="mx-auto"
                    isDisabled={code === 6}
                    autoFocus={true}
                    
                  />
                  <div className="mt-3 flex items-center justify-between">
                    <button
                      type="button"
                      onClick={doResend}
                      disabled={sec > 0}
                      className={["text-xs",
                        sec > 0
                          ? "text-zinc-500 dark:text-zinc-500 cursor-not-allowed"
                          : "text-sky-600 hover:underline dark:text-sky-400",
                      ].join(" ")}
                    >
                      {sec > 0 ? `ขอรหัสใหม่ได้ใน ${formatTime(sec)}` : "ขอรหัสใหม่"}
                    </button>
                    <button
                      type="button"
                      onClick={onClose}
                      className="text-xs text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200"
                    >
                      ปิด
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
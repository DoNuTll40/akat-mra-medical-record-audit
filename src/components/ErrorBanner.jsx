import { useState, useEffect, useMemo } from "react";
import { ShieldAlert, RotateCw, ChevronDown, ChevronUp, Copy, X } from "lucide-react";
import { motion } from "framer-motion";
import Ripple from "material-ripple-effects";
import { addToast } from "@heroui/toast";
import moment from "moment/moment";

function normalizeError(err) {
  // ตัด Axios/Fetch/Error/string ออกมาให้เหลือ message+details
  const any = err;
  const message =
    any?.response?.data?.message ??
    any?.message ??
    (typeof err === "string" ? err : "เกิดข้อผิดพลาดที่ไม่ทราบสาเหตุ");

  // details เอา JSON string ทั้งก้อนแบบย่อ
  let details = "";
  try {
    details =
      any?.stack ??
      JSON.stringify(
        {
          status: any?.response?.status,
          url: any?.config?.url || any?.request?.responseURL,
          data: any?.response?.data,
        },
        null,
        2
      );
  } catch {
    details = String(any);
  }
  return { message, details };
}

export function ErrorBanner({ err, onRetry, onDismiss, errorId, autoRetrySec }) {
  const [showDetails, setShowDetails] = useState(false);
  const [retrying, setRetrying] = useState(false);
  const [countdown, setCountdown] = useState(autoRetrySec ?? null);

  const ts = useMemo(() => new Date(), []);
  const id = useMemo(() => errorId ?? Math.random().toString(36).slice(2, 10), [errorId]);
  const { message, details } = normalizeError(err);

  const ripple = new Ripple();

  useEffect(() => {
    if (!countdown || !onRetry) return;
    const t = setInterval(() => {
      setCountdown((s) => {
        if (s === null) return s;
        if (s <= 1) {
          clearInterval(t);
          setRetrying(true);
          Promise.resolve(onRetry()).finally(() => setRetrying(false));
          return null;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [countdown, onRetry]);

  const copy = async () => {
    const payload = `Error ID: ${id}\nTime: ${moment(ts).locale("th").add(543, "years").format("วันที่ DD/MM/YYYY เวลา HH:mm น.")}\nMessage: ${message}\n\nDetails:\n${details}`;
    try {
        addToast({ title: "สําเร็จ", description: "คัดลอกเรียบร้อยแล้ว", color: "success", shouldShowTimeoutProgress: true });
        await navigator.clipboard.writeText(payload);
    } catch {
      // ปล่อยผ่าน
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      role="alert"
      aria-live="polite"
      className="rounded-2xl border border-rose-300 bg-rose-50 dark:border-rose-800 dark:bg-rose-950 text-rose-700 dark:text-rose-200 p-4"
    >
      <div className="flex items-start gap-3">
        <div className="border border-rose-700/70 bg-rose-100 dark:border-rose-800 dark:bg-rose-800 text-rose-700 dark:text-rose-200 rounded-full p-2">
          <ShieldAlert className="size-5" />
        </div>

        <div className="min-w-0 flex-1 transition-all ease-in-out duration-300">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="font-semibold truncate">เกิดข้อผิดพลาด : {message}</p>
            <div className="text-xs text-rose-600/80 dark:text-rose-300/80">
              <span className="mr-2">ID: {id}</span>
              <span>{moment(ts).locale("th").add(543, "years").format("วันที่ DD/MM/YYYY เวลา HH:mm น.")}</span>
            </div>
          </div>

          {/* action row */}
          <div className="mt-3 flex flex-wrap items-center gap-2">
            {onRetry && (
              <motion.button
                whileTap={{ scale: 0.98 }}
                onMouseUp={(e) => ripple.create(e)}
                onClick={async () => {
                  setCountdown(null);
                  setRetrying(true);
                  await Promise.resolve(onRetry());
                  setRetrying(false);
                }}
                className="inline-flex items-center gap-1 rounded-lg bg-rose-600 text-white px-3 py-1.5 text-sm hover:bg-rose-500 disabled:opacity-60 cursor-pointer"
                disabled={retrying}
              >
                <RotateCw className={`size-4 ${retrying ? "animate-spin" : ""}`} />
                {retrying ? "กำลังลองใหม่..." : countdown ? `ลองใหม่ใน ${countdown}s` : "ลองใหม่"}
              </motion.button>
            )}

            <motion.button
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowDetails((s) => !s)}
              onMouseUp={(e) => ripple.create(e)}
              className="inline-flex items-center gap-1 rounded-lg border border-rose-300 dark:border-rose-700 px-3 py-1.5 text-sm hover:bg-rose-100/60 dark:hover:bg-rose-900/50 cursor-pointer"
            >
              {showDetails ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}
              รายละเอียด
            </motion.button>

            <motion.button
              whileTap={{ scale: 0.98 }}
              onMouseUp={(e) => ripple.create(e)}
              onClick={copy}
              className="inline-flex items-center gap-1 rounded-lg border border-rose-300 dark:border-rose-700 px-3 py-1.5 text-sm hover:bg-rose-100/60 dark:hover:bg-rose-900/50 cursor-pointer"
            >
              <Copy className="size-4" />
              คัดลอก
            </motion.button>

            {onDismiss && (
              <motion.button
                whileTap={{ scale: 0.98 }}
                onMouseUp={(e) => ripple.create(e)}
                onClick={onDismiss}
                className="ml-auto inline-flex items-center gap-1 rounded-full px-2 py-2 text-sm hover:bg-rose-100/60 dark:hover:bg-rose-900/50"
                aria-label="ปิด"
                title="ปิด"
              >
                <X className="size-4" />
              </motion.button>
            )}
          </div>

          {/* collapsible details */}
          {showDetails && (
            <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 6 }}
            transition={{ duration: 0.2 }}
            className="mt-3">
              <pre className="max-h-48 overflow-auto rounded-xl bg-white/70 dark:bg-black/30 p-3 text-xs text-rose-900 dark:text-rose-100 leading-5">
                {details}
              </pre>
            </motion.div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Ripple from "material-ripple-effects";

export default function WardRow({ name, value, total, token, fetchDashboardWard, setShowModal }) {
  const pct = Math.min(100, Math.round((Number(value || 0) / total) * 100));
  const [isClicked, setIsClicked] = useState(false);
  const ripple = new Ripple();

  useEffect(() => {
    token && setIsClicked(true);
  }, [])

  const hdlClick = (data) => {
    setShowModal(true);
    fetchDashboardWard(data);
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      onClick={() => isClicked && hdlClick(name)}
      onMouseDown={(e) => isClicked && ripple.create(e)}
      className={`${isClicked ? "cursor-pointer" : "cursor-default"} rounded-xl border backdrop-blur-2xl bg-white/5 border-zinc-200 dark:border-[#3a3a3a] p-3 shadow-lg shadow-zinc-950/5 dark:shadow-zinc-800/40`}>
      <div className="flex items-center justify-between">
        <p className="font-medium">{name}</p>
        <p className="text-sm text-zinc-600 dark:text-zinc-300">{Number(value).toLocaleString("th-TH")}</p>
      </div>
      <div className="mt-2 h-2 w-full rounded-full bg-zinc-100 dark:bg-zinc-600 overflow-hidden">
        <div
          className="h-full rounded-full shadow bg-gradient-to-r from-emerald-500 to-emerald-600 dark:bg-emerald-600"
          style={{ width: `${pct}%` }}
          aria-label={`${name} ${pct}%`}
        />
      </div>
    </motion.div>
  );
}
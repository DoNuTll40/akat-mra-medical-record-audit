import { motion } from "framer-motion";

export default function StatCard({ icon, label, value, hint }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border border-zinc-300 dark:border-[#505050] bg-white dark:bg-[#181818] p-4 shadow-lg shadow-zinc-950/5"
    >
      <div className="flex items-start gap-3">
        <div className="rounded-xl bg-zinc-100 dark:bg-zinc-800 p-2.5">{icon}</div>
        <div>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">{label}</p>
          <p className="text-2xl font-semibold leading-tight">{Number(value).toLocaleString("th-TH")}</p>
          {hint ? <p className="text-xs text-zinc-400 mt-0.5">{hint}</p> : null}
        </div>
      </div>
    </motion.div>
  );
}
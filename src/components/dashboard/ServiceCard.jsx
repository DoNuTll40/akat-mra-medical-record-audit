export default function ServiceCard({ name, value }) {
  return (
    <div className="rounded-xl border border-zinc-200 dark:border-[#3a3a3a] p-3 bg-white/5 backdrop-blur-2xl shadow-lg shadow-zinc-950/5 dark:shadow-zinc-800/40">
      <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-1">{name}</p>
      <p className="text-xl font-semibold">{Number(value).toLocaleString("th-TH")}</p>
    </div>
  );
}
export default function Card({ children }) {
  return (
    <div className="relative rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#1B1B1D] shadow-lg shadow-zinc-950/5">
      {children}
    </div>
  );
}
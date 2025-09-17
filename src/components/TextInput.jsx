export default function TextInput(props) {
  const base =
    "w-full rounded-lg px-3 py-2.5 text-sm outline-none border transition " +
    "bg-white dark:bg-zinc-900 border-zinc-300 dark:border-zinc-700 " +
    "placeholder:text-zinc-400 focus:border-sky-500 focus:ring-2 focus:ring-sky-200 dark:focus:ring-sky-700/40";
  return <input {...props} className={`${base} ${props.className || ""}`} />;
}
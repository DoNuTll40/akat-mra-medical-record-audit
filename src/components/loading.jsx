export default function LoadingCenter({ title = "กำลังตรวจสอบสิทธิ์การเข้าถึง..." }) {
  return (
    <div className="w-full flex items-center justify-center px-4">
        {/* สปินเนอร์ + ข้อความ */}
        <div className="mt-6 flex items-center gap-3 text-zinc-600 dark:text-zinc-300 font-semibold">
          <span
            className="inline-block size-7 rounded-full border-[3.5px] 
            border-zinc-500/40 border-t-emerald-500 animate-spin"
            aria-hidden
          />
          <span className="text-base">{title}</span>
        </div>
    </div>
  );
}
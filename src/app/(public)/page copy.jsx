"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Plus, X, AlertTriangle, Clock,
  TrendingUp, TrendingDown, Search, Filter,
  CalendarDays, CheckCircle2, Activity, FlaskConical
} from "lucide-react";
import Ripple from "material-ripple-effects";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

/* ---------- UI helpers ---------- */
function StatCard({ label, value, diff, positive, right }) {
  return (
    <div className="rounded-2xl border border-black/5 dark:border-white/10 bg-white/70 dark:bg-white/[0.04] p-4 shadow-sm backdrop-blur-sm">
      <div className="flex items-start justify-between">
        <p className="text-sm text-gray-500">{label}</p>
        {right}
      </div>
      <div className="mt-2 flex items-end gap-2">
        <p className="text-3xl font-semibold tracking-tight">{value}</p>
        {typeof diff === "number" && (
          <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs
            ${positive ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300"
                       : "bg-rose-50 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300"}`}>
            {positive ? <TrendingUp className="h-3.5 w-3.5" /> : <TrendingDown className="h-3.5 w-3.5" />}
            {positive ? "+" : ""}{diff}%
          </span>
        )}
      </div>
      {/* sparkline */}
      <svg className="mt-3 h-10 w-full" viewBox="0 0 100 24" fill="none">
        <path d="M2 20 L15 12 L28 14 L41 8 L54 10 L67 6 L80 10 L93 4"
          className="stroke-[2]"
          stroke="currentColor"
          opacity="0.18" />
        <path d="M2 20 L15 12 L28 14 L41 8 L54 10 L67 6 L80 10 L93 4"
          className="stroke-[1.5]"
          stroke="currentColor"
          opacity="0.6"
          strokeLinecap="round"
          strokeLinejoin="round" />
      </svg>
    </div>
  );
}

function Badge({ children, color = "gray" }) {
  const map = {
    gray: "bg-gray-100 text-gray-700 dark:bg-gray-800/60 dark:text-gray-300",
    green: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300",
    yellow: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300",
    red: "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300",
    blue: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
  };
  return <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs ${map[color]}`}>{children}</span>;
}

function Modal({
  open,
  onClose,
  title,
  children,
  onSubmit,
  submitText = "บันทึก",
}) {
  const panelRef = useRef(null);
  const shouldReduce = useReducedMotion();

  // ปิดด้วย ESC
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === "Escape") onClose?.();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  // โฟกัสปุ่มบันทึกเมื่อเปิด (เล็ก ๆ ช่วยด้าน a11y)
  useEffect(() => {
    if (open && panelRef.current) {
      const btn = panelRef.current.querySelector("[data-primary]");
      btn?.focus();
    }
  }, [open]);

  const overlayVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
    exit: { opacity: 0 },
  };

  const panelVariants = shouldReduce
    ? {
        hidden: { opacity: 0 },
        visible: { opacity: 1 },
        exit: { opacity: 0 },
      }
    : {
        hidden: { opacity: 0, y: 16, scale: 0.98 },
        visible: { opacity: 1, y: 0, scale: 1 },
        exit: { opacity: 0, y: 12, scale: 0.98 },
      };

  const panelTransition = shouldReduce
    ? { duration: 0.15 }
    : { type: "spring", stiffness: 420, damping: 32, mass: 0.8 };

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50">
          {/* Overlay */}
          <motion.button
            type="button"
            aria-label="Close modal"
            className="absolute inset-0 bg-black/30 backdrop-blur-sm"
            onClick={onClose}
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={overlayVariants}
            transition={{ duration: 0.15 }}
          />

          {/* Panel */}
          <div className="absolute inset-0 grid place-items-center p-4">
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-labelledby="modal-title"
              ref={panelRef}
              className="w-full max-w-xl rounded-2xl border border-black/10 dark:border-white/10 bg-white dark:bg-[#151515] shadow-2xl"
              initial="hidden"
              animate="visible"
              exit="exit"
              variants={panelVariants}
              transition={panelTransition}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between px-5 py-4 border-b border-black/10 dark:border-white/10">
                <h3 id="modal-title" className="text-lg font-medium">
                  {title}
                </h3>
                <button
                  onClick={onClose}
                  className="rounded-full p-1 hover:bg-black/5 dark:hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-black/20 dark:focus:ring-white/20"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="px-5 py-4">{children}</div>

              <div className="flex items-center justify-end gap-2 px-5 py-3 border-t border-black/10 dark:border-white/10">
                <button
                  onClick={onClose}
                  className="rounded-lg px-3 py-1.5 text-sm hover:bg-black/5 dark:hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-black/20 dark:focus:ring-white/20"
                >
                  ยกเลิก
                </button>
                <button
                  data-primary
                  onClick={onSubmit}
                  className="inline-flex items-center gap-2 rounded-lg bg-black text-white dark:bg-white dark:text-black px-3 py-1.5 text-sm hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-black/30 dark:focus:ring-white/30"
                >
                  <CheckCircle2 className="h-4 w-4" /> {submitText}
                </button>
              </div>
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
}

/* ---------- Mock data ---------- */
const MOCK_ADMISSIONS = [
  { an: "6600123", hn: "10987", name: "นายสายลม ชื่นใจ", ward: "อายุรกรรมชาย", bed: "เตียง 5/12", diag: "Pneumonia", stay: "1d" },
  { an: "6600124", hn: "11901", name: "นางจิราพร วัฒน์ดี", ward: "อายุรกรรมหญิง", bed: "เตียง 3/09", diag: "DM foot", stay: "2d" },
  { an: "6600125", hn: "13008", name: "เด็กชายกฤตย์ ทองแท้", ward: "ศัลยกรรมหญิง", bed: "เตียง 1/04", diag: "Appendicitis", stay: "9h" },
];

const MOCK_LABS = [
  { name: "นางสมใจ แข็งดี", test: "CBC", status: "สำเร็จ", ago: "35m" },
  { name: "นายสดชื่น พรมดี", test: "FBS", status: "กำลังทำ", ago: "-" },
  { name: "ด.ญ.ชัญญา ยิ้มแย้ม", test: "Urinalysis", status: "สำเร็จ", ago: "22m" },
];

const MOCK_ALERTS = [
  { time: "08:42", text: "ระบบเวชระเบียนช้ากว่าปกติในช่วง 08:30–09:00 (query ช้าในตาราง vn_stat)", level: "warning" },
  { time: "วันนี้", text: "พรุ่งนี้ 09:00–10:00 ปิดปรับปรุงคลังยา (เพิ่มดัชนี)", level: "info" },
];

/* ---------- Page ---------- */
export default function Page() {

  const ripple = new Ripple();

  // modal
  const [openModal, setOpenModal] = useState(false);
  // form
  const [form, setForm] = useState({ title: "", message: "", level: "info" });
  // filter
  const [keyword, setKeyword] = useState("");
  const [onlyCritical, setOnlyCritical] = useState(false);

  const filteredAdmissions = useMemo(() => {
    const kw = keyword.trim().toLowerCase();
    return MOCK_ADMISSIONS.filter((r) => {
      const hit =
        r.an.includes(kw) ||
        r.hn.includes(kw) ||
        r.name.toLowerCase().includes(kw) ||
        r.diag.toLowerCase().includes(kw) ||
        r.ward.toLowerCase().includes(kw);
      return kw ? hit : true;
    });
  }, [keyword]);

  const todayStats = {
    patients: 312,
    admit: 18,
    avgTime: "23 นาที",
    bed: "27 / 120",
  };

  const handleSubmit = () => {
    // คุณจะยิง API ที่นี่
    console.log("submit announcement", form);
    setOpenModal(false);
    setForm({ title: "", message: "", level: "info" });
    alert("บันทึกประกาศ (mock) เรียบร้อย");
  };

  return (
    <div className="space-y-6">
      {/* Header actions */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">ภาพรวมระบบ (Dashboard)</h1>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setOpenModal(true)}
            className="inline-flex items-center gap-2 rounded-xl bg-black text-white dark:bg-white dark:text-black px-3 py-2 text-sm hover:opacity-90"
            onMouseUp={(e) => ripple.create(e, 'dark')}
          >
            <Plus className="h-4 w-4" />
            เพิ่มประกาศ
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label="ผู้ป่วยนอก (วันนี้)" value={todayStats.patients} diff={6.1} positive right={<Activity className="h-4 w-4 text-gray-400" />} />
        <StatCard label="รักษาใน (admit วันนี้)" value={todayStats.admit} diff={-2} positive={false} right={<CalendarDays className="h-4 w-4 text-gray-400" />} />
        <StatCard label="คิวตรวจ (เฉลี่ย)" value={todayStats.avgTime} diff={-4} positive right={<Clock className="h-4 w-4 text-gray-400" />} />
        <StatCard label="เตียงว่าง/ทั้งหมด" value={todayStats.bed} diff={22.5} positive right={<TrendingUp className="h-4 w-4 text-gray-400" />} />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        {/* Left column */}
        <div className="xl:col-span-2 space-y-4">
          {/* Intro + filter */}
          <div className="rounded-2xl border border-black/5 dark:border-white/10 bg-white/70 dark:bg-white/[0.04] p-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-medium">สรุปภาพรวม</h2>
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
                  <input
                    value={keyword}
                    onChange={(e) => setKeyword(e.target.value)}
                    placeholder="ค้นหา (AN, HN, ชื่อ, Dx, Ward)"
                    className="w-56 rounded-lg border border-black/10 dark:border-white/10 bg-transparent pl-8 pr-3 py-2 text-sm outline-none focus:ring-2 focus:ring-black/10 dark:focus:ring-white/20"
                  />
                </div>
                <button
                  onClick={() => setOnlyCritical((v) => !v)}
                  className={`inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm border
                    ${onlyCritical
                      ? "border-rose-400 text-rose-600 dark:text-rose-300 dark:border-rose-700"
                      : "border-black/10 dark:border-white/10 text-gray-600"}`}
                  disabled
                  title="(ตัวอย่าง) ฟิลเตอร์ผู้ป่วยวิกฤต"
                >
                  <Filter className="h-4 w-4" /> วิกฤต
                </button>
              </div>
            </div>
            <p className="mt-3 text-sm text-gray-600 dark:text-gray-300">
              โรงพยาบาลยุคใหม่พึ่งพาระบบสารสนเทศครอบคลุมทั้งเวชระเบียน การเงิน นัดหมาย ห้องแล็บ และคลังยา — หน้าแดชบอร์ดนี้ช่วยให้เห็นภาพรวมสำคัญแบบเรียลไทม์
            </p>
          </div>

          {/* Admissions table */}
          <div className="rounded-2xl border border-black/5 dark:border-white/10 overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 bg-white/70 dark:bg-white/[0.04] border-b border-black/10 dark:border-white/10">
              <h3 className="font-medium">ผู้ป่วยใน (Admissions) ล่าสุด</h3>
              <Badge color="blue">แสดง {filteredAdmissions.length} รายการ</Badge>
            </div>
            <div className="overflow-x-auto bg-white dark:bg-[#121212]">
              <table className="w-full text-sm">
                <thead className="text-left text-gray-500">
                  <tr className="border-b border-black/10 dark:border-white/10">
                    <th className="px-4 py-2">AN</th>
                    <th className="px-4 py-2">HN / ชื่อ</th>
                    <th className="px-4 py-2">Ward/Bed</th>
                    <th className="px-4 py-2">Diag</th>
                    <th className="px-4 py-2 text-right">ระยะเวลา</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAdmissions.map((r) => (
                    <tr key={r.an} className="border-b border-black/5 dark:border-white/5">
                      <td className="px-4 py-2 font-medium">{r.an}</td>
                      <td className="px-4 py-2">
                        <div className="font-medium">{r.hn}</div>
                        <div className="text-xs text-gray-500">{r.name}</div>
                      </td>
                      <td className="px-4 py-2">
                        <div>{r.ward}</div>
                        <div className="text-xs text-gray-500">{r.bed}</div>
                      </td>
                      <td className="px-4 py-2">{r.diag}</td>
                      <td className="px-4 py-2 text-right">{r.stay}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right column */}
        <div className="space-y-4">
          {/* Alerts */}
          <div className="rounded-2xl border border-black/5 dark:border-white/10 bg-white/70 dark:bg-white/[0.04]">
            <div className="flex items-center justify-between px-4 py-3 border-b border-black/10 dark:border-white/10">
              <h3 className="font-medium flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-amber-500" /> แจ้งเตือนระบบ
              </h3>
              <Badge color="yellow">2 รายการ</Badge>
            </div>
            <div className="divide-y divide-black/5 dark:divide-white/5">
              {MOCK_ALERTS.map((a, idx) => (
                <div key={idx} className="px-4 py-3">
                  <div className="text-xs text-gray-500">{a.time}</div>
                  <div className="mt-1 text-sm">{a.text}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Latest labs */}
          <div className="rounded-2xl border border-black/5 dark:border-white/10 bg-white/70 dark:bg-white/[0.04]">
            <div className="flex items-center justify-between px-4 py-3 border-b border-black/10 dark:border-white/10">
              <h3 className="font-medium flex items-center gap-2"><FlaskConical className="h-4 w-4" /> สถานะ Lab ล่าสุด</h3>
              <Badge>อัปเดต 2 นาทีที่แล้ว</Badge>
            </div>
            <div className="divide-y divide-black/5 dark:divide-white/5">
              {MOCK_LABS.map((l, idx) => (
                <div key={idx} className="px-4 py-3">
                  <div className="flex items-center justify-between">
                    <div className="font-medium">{l.name}</div>
                    <div>
                      {l.status === "สำเร็จ" ? (
                        <Badge color="green">สำเร็จ • {l.ago}</Badge>
                      ) : (
                        <Badge color="yellow">กำลังทำ</Badge>
                      )}
                    </div>
                  </div>
                  <div className="text-xs text-gray-500">{l.test}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Modal: New Announcement */}
      <Modal
        open={openModal}
        onClose={() => setOpenModal(false)}
        title="สร้างประกาศใหม่"
        submitText="บันทึกประกาศ"
        onSubmit={handleSubmit}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-gray-600 dark:text-gray-300 mb-1">หัวข้อ</label>
            <input
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              placeholder="เช่น ระบบนัดหมายอาจช้าช่วง 09:00–09:30"
              className="w-full rounded-lg border border-black/10 dark:border-white/10 bg-transparent px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-black/10 dark:focus:ring-white/20"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-600 dark:text-gray-300 mb-1">รายละเอียด</label>
            <textarea
              rows={4}
              value={form.message}
              onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
              className="w-full rounded-lg border border-black/10 dark:border-white/10 bg-transparent px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-black/10 dark:focus:ring-white/20"
              placeholder="สาเหตุ/ผลกระทบ/ช่วงเวลาแก้ไขโดยประมาณ…"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-600 dark:text-gray-300 mb-1">ระดับความสำคัญ</label>
            <div className="flex gap-2">
              {["info","warning","critical"].map((lv) => (
                <button
                  key={lv}
                  onClick={() => setForm((f) => ({ ...f, level: lv }))}
                  className={`rounded-lg px-3 py-1.5 text-sm border
                    ${form.level === lv ? "border-black dark:border-white" : "border-black/10 dark:border-white/10 text-gray-600"}`}
                  type="button"
                >
                  {lv}
                </button>
              ))}
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
}

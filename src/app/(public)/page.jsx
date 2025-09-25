"use client";

import { useEffect, useMemo, useState } from "react";
import axiosApi from "@/config/axios-api";
import { motion } from "framer-motion";
import { Activity, Building2, ClipboardList, ListFilter, ShieldAlert } from "lucide-react";
import { ErrorBanner } from "@/components/ErrorBanner";
import { Skeleton } from "@heroui/react";

export default function DashboardShowcase() {
  const [data, setData] = useState({ countAll: 0, countWard: [], countPatientService: [] });
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);

  useEffect(() => {
    fetchDashboard();
  }, []);
  
  const fetchDashboard = async () => {
    try {
      const res = await axiosApi.get("/dashboard");
      setData(res.data ?? {});
    } catch (e) {
      setErr(e?.response?.data?.message || "โหลดข้อมูลไม่สำเร็จ");
    } finally {
      setLoading(false);
    }
  };
  
  const totalWardForms = useMemo(
    () => (Array.isArray(data.countWard) ? data.countWard.reduce((s, w) => s + (Number(w?.result) || 0), 0) : 0),
    [data.countWard]
  );

  const totalByService = useMemo(
    () => (Array.isArray(data.countPatientService) ? data.countPatientService.reduce((s, it) => s + (Number(it?.result) || 0), 0) : 0),
    [data.countPatientService]
  );

  if (loading) {
    return (
      // <LoadingCenter />
      <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Skeleton
            key={i}
            className="h-24 rounded-2xl border border-zinc-300 dark:border-[#505050] bg-white dark:bg-zinc-900 shadow-lg shadow-zinc-950/5"
          />
        ))}
        <Skeleton className="h-36 mt-6 md:col-span-1 rounded-2xl border border-zinc-300 dark:border-[#505050] bg-white dark:bg-zinc-900 shadow-lg shadow-zinc-950/5" />
        <Skeleton className="h-36 mt-6 md:col-span-3 rounded-2xl border border-zinc-300 dark:border-[#505050] bg-white dark:bg-zinc-900 shadow-lg shadow-zinc-950/5" />
      </div>
    );
  }

  if (err) {
    return (
      <ErrorBanner
        err={err}
        onRetry={fetchDashboard}      // ฟังก์ชันเดิมของนาย
        onDismiss={() => setErr(null)}
        autoRetrySec={10}             // ไม่อยาก auto ก็ไม่ต้องส่ง
      />
    );
  }

  return (
    <div className="space-y-6 select-none">
      {/* แถวสถิติบนสุด */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={<ClipboardList className="size-5" />}
          label="จำนวนทั้งหมด"
          value={data.countAll ?? 0}
        />
        <StatCard
          icon={<Building2 className="size-5" />}
          label="จำนวนฟอร์มของตึก (รวม)"
          value={totalWardForms}
          hint={`${(data.countWard?.length || 0)} ตึก`}
        />
        <StatCard
          icon={<Activity className="size-5" />}
          label="จำนวนตามประเภทบริการ"
          value={totalByService}
          hint={data.countPatientService?.map((s) => s.patient_service_name_english).join(" • ")}
        />
        <StatCard
          icon={<ListFilter className="size-5" />}
          label="ตึกที่มีแบบฟอร์ม"
          value={data.countWard?.length ?? 0}
        />
      </div>

      {/* แถวล่าง: ซ้าย = รายตึก, ขวา = ตามบริการ */}
      <div className="grid gap-4 lg:grid-cols-3">
        {/* รายตึก */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border border-zinc-300 dark:border-[#505050] bg-white dark:bg-[#181818]"
        >
          <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-200 dark:border-[#3a3a3a]">
            <p className="font-semibold">จำนวนฟอร์มของตึก</p>
            <span className="text-xs text-zinc-500 dark:text-zinc-400">
              รวม {totalWardForms.toLocaleString("th-TH")}
            </span>
          </div>

          <div className="p-4 space-y-3">
            {Array.isArray(data.countWard) && data.countWard.length > 0 ? (
              data.countWard.map((w) => (
                <WardRow key={w.patient_ward} name={w.patient_ward} value={w.result} total={totalWardForms || 1} />
              ))
            ) : (
              <EmptyRow text="ยังไม่มีข้อมูลตึก" />
            )}
          </div>
        </motion.div>

        {/* ตามบริการ */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="lg:col-span-2 rounded-2xl border border-zinc-300 dark:border-[#505050] bg-white dark:bg-[#181818]"
        >
          <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-200 dark:border-[#3a3a3a]">
            <p className="font-semibold">จำแนกตามประเภทบริการ</p>
            <span className="text-xs text-zinc-500 dark:text-zinc-400">
              รวม {totalByService.toLocaleString("th-TH")}
            </span>
          </div>

          <div className="p-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {Array.isArray(data.countPatientService) && data.countPatientService.length > 0 ? (
              data.countPatientService.map((s) => (
                <ServiceCard key={s.patient_service_name_english} name={s.patient_service_name_english} value={s.result} />
              ))
            ) : (
              <div className="col-span-full">
                <EmptyRow text="ยังไม่มีข้อมูลประเภทบริการ" />
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}

/* ===== ชิ้นส่วนย่อย ===== */

function StatCard({ icon, label, value, hint }) {
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

function WardRow({ name, value, total }) {
  const pct = Math.min(100, Math.round((Number(value || 0) / total) * 100));
  return (
    <div className="rounded-xl border backdrop-blur-2xl bg-white/5 border-zinc-200 dark:border-[#3a3a3a] p-3 shadow-lg shadow-zinc-950/5 dark:shadow-zinc-800/40">
      <div className="flex items-center justify-between">
        <p className="font-medium">{name}</p>
        <p className="text-sm text-zinc-600 dark:text-zinc-300">{Number(value).toLocaleString("th-TH")}</p>
      </div>
      <div className="mt-2 h-2 w-full rounded-full bg-zinc-100 dark:bg-zinc-600 overflow-hidden">
        <div
          className="h-full rounded-full bg-emerald-500 dark:bg-emerald-600"
          style={{ width: `${pct}%` }}
          aria-label={`${name} ${pct}%`}
        />
      </div>
    </div>
  );
}

function ServiceCard({ name, value }) {
  return (
    <div className="rounded-xl border border-zinc-200 dark:border-[#3a3a3a] p-3 bg-white/5 backdrop-blur-2xl shadow-lg shadow-zinc-950/5 dark:shadow-zinc-800/40">
      <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-1">{name}</p>
      <p className="text-xl font-semibold">{Number(value).toLocaleString("th-TH")}</p>
    </div>
  );
}

function EmptyRow({ text }) {
  return (
    <div className="rounded-xl border border-dashed border-zinc-300 dark:border-zinc-700 p-6 text-center text-sm text-zinc-500 dark:text-zinc-400">
      {text}
    </div>
  );
}

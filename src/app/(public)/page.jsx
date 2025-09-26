"use client";

import { useEffect, useMemo, useState } from "react";
import axiosApi from "@/config/axios-api";
import { AnimatePresence, motion } from "framer-motion";
import { Activity, Building2, ClipboardList, FileCheck2, FilePenLine, ListFilter, ShieldAlert } from "lucide-react";
import { ErrorBanner } from "@/components/ErrorBanner";
import { addToast, Skeleton } from "@heroui/react";
import EmptyRow from "@/components/dashboard/EmptyRow";
import ServiceCard from "@/components/dashboard/ServiceCard";
import WardRow from "@/components/dashboard/WardRow";
import StatCard from "@/components/dashboard/StatCard";
import ModalWardCard from "@/components/modal/ModalWardCard";

export default function DashboardShowcase() {
  const [data, setData] = useState({ countAll: 0, countWard: [], countPatientService: [] });
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);
  const [ wardName, setWardName ] = useState("");
  const [ wardData, setWardData ] = useState([]);
  const [ showModalWard, setShowModalWard ] = useState(false);
  
  let token = localStorage.getItem("token");

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

  const fetchDashboardWard = async (ward) => {
    setWardName("");
    try {
      const res = await axiosApi.get(`/dashboard/${ward}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setWardData(res.data.data ?? {});
      setWardName(ward);
    } catch (err) {
      console.log(err)
      addToast({ title: "เกิดข้อผิดพลาด", description: err.response.data.message, timeout: 8000, color: "danger", shouldShowTimeoutProgress: true });
    }
  }
  
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
          icon={<Activity className="size-5" />}
          label="จำนวนตามประเภทบริการ"
          value={totalByService}
          hint={data.countPatientService?.map((s) => s.patient_service_name_english).join(" • ")}
        />
        <StatCard
          icon={<FileCheck2 className="size-5" />}
          label="ฟอร์มที่สมบูรณ์"
          value={data.countAllPercentageNotNull || 0}
          hint={`ทั้งหมด ${data.countAll || 0} ฟอร์ม`}
        />
        <StatCard
          icon={<FilePenLine className="size-5" />}
          label="ฟอร์มที่ยังไม่สมบูรณ์"
          value={data.countAllPercentageNull || 0}
          hint={`ทั้งหมด ${data.countAll || 0} ฟอร์ม`}
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
                <WardRow 
                  key={w.patient_ward} 
                  name={w.patient_ward} 
                  value={w.result} 
                  total={totalWardForms || 1} 
                  token={token} 
                  fetchDashboardWard={fetchDashboardWard} 
                  setShowModal={setShowModalWard}
                />
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

      <AnimatePresence mode="sync">
        {showModalWard && (
          <ModalWardCard
            title="จำนวนฟอร์มของตึก"
            subtitle={wardName}
            key="ward"
            data={wardData}
            onClose={() => setShowModalWard(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
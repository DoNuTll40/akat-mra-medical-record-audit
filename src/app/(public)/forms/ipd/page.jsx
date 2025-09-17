"use client";

import { useEffect, useState } from "react";
import { forbidden } from "next/navigation";
import LoadingCenter from "@/components/loading";

export default function Page() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem("profile");
    if (stored) {
    const parsed = JSON.parse(stored);

    if (parsed.fullname && parsed.fullname !== "") {
        setLoading(false);
      } else {
        return forbidden();
      }
    }
  }, []);

  if (loading) {
    return <LoadingCenter />;
  }

  return (
    <div>
      <p className="text-lg font-bold">
        แบบตรวจประเมินคุณภาพการบันทึกเวชระเบียนผู้ป่วยใน Medical Record Audit Form (IPD)
      </p>
    </div>
  );
}
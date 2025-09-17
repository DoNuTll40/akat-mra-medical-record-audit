"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { AgGridReact } from "ag-grid-react";
import {
  AllCommunityModule,
  ModuleRegistry,
} from "ag-grid-community";
import { Search, Download, RefreshCcw } from "lucide-react";
import { useTheme } from "next-themes";

import "ag-grid-community/styles/ag-theme-quartz.css";

ModuleRegistry.registerModules([AllCommunityModule]);

export default function UnitsPage() {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const themeClass = mounted && resolvedTheme === "dark" ? "ag-theme-quartz-dark" : "ag-theme-quartz";

  const gridApi = useRef(null);
  const [quick, setQuick] = useState("");
  const [rows, setRows] = useState(() => mockUnits(36));

  const defaultColDef = useMemo(
    () => ({
      // rowDrag: true,
      sortable: true,
      resizable: true,
      // filter: true,
      suppressMenu: true,
      flex: 1,
      minWidth: 120,
      cellClass: ["text-[13px]"],
      headerClass: ["text-[12px] font-semibold"],
    }),
    []
  );

  const cols = useMemo(
    () => [
      { headerName: "รหัส", field: "code", width: 110, pinned: "left", rowDrag: true},
      { headerName: "หน่วยบริการ", field: "name", minWidth: 220 },
      { headerName: "Ward", field: "ward", width: 120 },
      { headerName: "หัวหน้าหน่วย", field: "head", minWidth: 160 },
      {
        headerName: "เตียง",
        field: "beds",
        width: 90,
        valueFormatter: p => (p.value ?? 0).toLocaleString("th-TH"),
        cellClass: ["text-right"],
      },
      { headerName: "โทร", field: "phone", width: 120 },
      {
        headerName: "สถานะ",
        field: "active",
        width: 120,
        cellRenderer: (p) => (
          <span
            className={[
              "inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold",
              p.value
                ? "bg-emerald-500/15 text-emerald-300 ring-1 ring-inset ring-emerald-500/30"
                : "bg-rose-500/15 text-rose-300 ring-1 ring-inset ring-rose-500/30",
            ].join(" ")}
          >
            <span className="mr-1 inline-block size-1.5 rounded-full bg-current opacity-70" />
            {p.value ? "พร้อมบริการ" : "ปิดชั่วคราว"}
          </span>
        ),
        sortable: true,
        comparator: (a, b) => Number(a) - Number(b),
      },
      {
        headerName: "อัปเดตล่าสุด",
        field: "updatedAt",
        minWidth: 180,
        valueGetter: (p) =>
          new Date(p.data?.updatedAt ?? Date.now()).toLocaleString("th-TH"),
      },
      {
        headerName: "",
        field: "actions",
        width: 120,
        pinned: "right",
        suppressMovable: true,
        sortable: false,
        filter: false,
        cellRenderer: (p) => (
          <button
            onClick={() => alert(`เปิด: ${p.data.name}`)}
            className="inline-flex items-center gap-2 rounded-lg bg-zinc-200 px-3 py-1.5 text-[12px] font-semibold text-zinc-900 hover:bg-zinc-100
                       dark:bg-zinc-800 dark:text-zinc-100 dark:hover:bg-zinc-700"
          >
            รายละเอียด
          </button>
        ),
      },
    ],
    []
  );

  function onGridReady(e) {
    gridApi.current = e.api;
    e.api.setGridOption("localeText", thLocale);
  }

  function onExport() {
    gridApi.current?.exportDataAsCsv({
      fileName: `units-${new Date().toISOString().slice(0, 10)}.csv`,
      columnSeparator: ",",
    });
  }

  function onRefresh() {
    // mock รีเฟรช
    setRows(mockUnits(36));
    gridApi.current?.setQuickFilter(quick);
  }

  useEffect(() => {
    gridApi.current?.setQuickFilter(quick);
  }, [quick]);

  return (
    <div className="p-4 md:p-4">
      {/* Title */}
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-extrabold tracking-tight">หน่วยบริการ (Units)</h1>
          <p className="text-sm text-zinc-400">รวมหน่วยงานในโรงพยาบาล ใช้ค้นหาและจัดการสถานะการให้บริการ</p>
        </div>

        {/* Toolbar */}
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="pointer-events-none absolute left-2 top-1/2 size-4 -translate-y-1/2 text-zinc-500" />
            <input
              value={quick}
              onChange={e => setQuick(e.target.value)}
              placeholder="ค้นหา (ชื่อ, รหัส, หัวหน้า, Ward)"
              className="w-64 rounded-lg border border-zinc-700 bg-zinc-900 px-8 py-2 text-sm text-zinc-200 placeholder-zinc-500
                         focus:border-zinc-500 focus:outline-none
                         dark:bg-zinc-900 dark:border-zinc-700"
            />
          </div>

          <button
            onClick={onRefresh}
            className="inline-flex items-center gap-2 rounded-lg border border-zinc-700 px-3 py-2 text-sm text-zinc-200 hover:bg-zinc-800"
            title="รีเฟรช"
          >
            <RefreshCcw className="size-4" />
            รีเฟรช
          </button>

          <button
            onClick={onExport}
            className="inline-flex items-center gap-2 rounded-lg bg-emerald-500 px-3 py-2 text-sm font-semibold text-white hover:bg-emerald-400"
            title="ส่งออก CSV"
          >
            <Download className="size-4" />
            ส่งออก
          </button>
        </div>
      </div>

      {/* Grid card */}
      <div style={{ height: "100%", width: "100%" }}>
        <div className={`${themeClass} w-full h-[77vh]`} >
          <AgGridReact
            columnDefs={cols}
            rowData={rows}
            defaultColDef={defaultColDef}
            animateRows
            rowSelection="single"
            // pagination
            // paginationPageSize={12}
            suppressMoveWhenRowDragging 
            suppressCellFocus
            rowDragManaged
            onGridReady={onGridReady}
            getRowId={p => p.data.code}
          />
        </div>
      </div>
    </div>
  );
}

/* ---------- mock + Thai locale ---------- */
function mockUnits(n) {
  const wards = ["ER", "OPD", "IPD1", "IPD2", "LR", "OR", "Dialysis"];
  const heads = ["พญ.สุพัตรา", "น.ส.มุกดา", "น.ส.วชิราภรณ์", "นพ.ธนกฤต", "พญ.วิมล", "น.ส.ชลิตา"];
  return Array.from({ length: n }, (_, i) => {
    const r = (seed) => (Math.abs(Math.sin(i * 9301 + seed * 49297)) % 1);
    return {
      code: `${11000 + i}`,
      name: `หน่วย ${["อายุรกรรม", "ศัลยกรรม", "กุมาร", "สูติ", "ตา", "จิตเวช"][i % 6]}`,
      head: heads[i % heads.length],
      beds: Math.floor(r(7) * 28) + 4,
      ward: wards[i % wards.length],
      phone: `0${Math.floor(800000000 + r(11) * 99999999)}`.slice(0, 10),
      active: r(13) > 0.25,
      updatedAt: new Date(Date.now() - r(17) * 1000 * 60 * 60 * 24 * 14).toISOString(),
    };
  });
}

const thLocale = {
  page: "หน้า",
  more: "เพิ่มเติม",
  to: "ถึง",
  of: "จาก",
  next: "ถัดไป",
  last: "สุดท้าย",
  first: "แรก",
  previous: "ก่อนหน้า",
  loadingOoo: "กำลังโหลด...",
  // ปรับเท่าที่จำเป็น ถ้าอยากละเอียดค่อยเติมภายหลัง
};

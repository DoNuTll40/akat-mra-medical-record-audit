"use client";

import axiosApi from "@/config/axios-api";
import { useEffect, useState, useMemo } from "react";
import AppDataGrid from "@/components/table/AppDataGrid";
import { motion } from "framer-motion";
import { convertDateTime } from "@/utils/convertDate";
import Ripple from "material-ripple-effects";
import LoadingCenter from "@/components/loading";
import ModalTextForm from "@/components/modal/ModalTextForm";
import { ListFilterPlus } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@heroui/popover";
import { addToast } from "@heroui/toast";
import Forbidden from "@/components/Forbidden";

export default function Page() {
  const [modalOpen, setModalOpen] = useState(false);
  const [editValues, setEditValues] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingAdd, setLoadingAdd] = useState(false);
  const [loadingDelete, setLoadingDelete] = useState(false);
  const [loadingUpdate, setLoadingUpdate] = useState(false);
  const [rowData, setRowData] = useState([]);
  const [ fetchPatinet, setFetchPatient ] = useState([]);
  const [ token, setToken ] = useState(localStorage.getItem("token"));

  if(localStorage.getItem("token") === null){
    return <Forbidden />
  }

  const ripple = new Ripple();

  const ButtonCellRenderer = (props) => {
    const handleClick = () => {
      // ค่าที่จะส่งไปให้ modal
      setEditValues({
        overall_finding_name: props.data?.overall_finding_name ?? "",
        patient_service_id: props.data?.patient_service_id,
        overall_finding_id: props.data?.overall_finding_id
      });
      setModalOpen(true);
    };

    return (
      <div className="flex gap-1 w-full justify-between items-center px-4">
        <motion.button whileTap={{ scale: 0.98 }} onClick={handleClick}>แก้ไข</motion.button>
        <Popover showArrow backdrop="opaque" offset={10} placement="bottom-end">
          <PopoverTrigger>
            <motion.button className="text-rose-700 font-semibold cursor-pointer">ลบ</motion.button>
          </PopoverTrigger>
          <PopoverContent className="flex flex-col gap-2 p-4">
            <p>กด "ยืนยัน" เพื่อลบหัวข้อ {props.data?.overall_finding_name ?? "-"} ออกจากระบบ</p>
            <motion.button
              className="w-full text-rose-700 font-semibold py-2 hover:bg-red-50 dark:hover:bg-rose-800 rounded-lg dark:bg-rose-700 dark:text-white cursor-pointer"
              onMouseUp={(e) => ripple.create(e)}
              onClick={() => hdlDelete(props.data?.overall_finding_id)}
            >ยืนยัน</motion.button>
          </PopoverContent>
        </Popover>
      </div>
    );
  };

  const columnDefs = [
    { field: "numeric_id", headerName: "ลำดับ", minWidth: 80, maxWidth: 80 },
    { field: "overall_finding_name", headerName: "หัวข้อ", minWidth: 200 },
    { 
      field: "patient_service_name_english",
      headerName: "กลุ่มคนไข้",
      minWidth: 200,
      valueGetter: (params) => { 
        return `${params.data?.patient_services?.patient_service_name_english} - ${params.data?.patient_services?.patient_service_name_thai}`
      } 
    },
    { field: "created_at", valueGetter: (p) => convertDateTime(p.data.created_at), headerName: "วันที่สร้าง", minWidth: 200 },
    { field: "created_by", headerName: "ชื่อที่สร้าง", minWidth: 200 },
    { field: "updated_at", valueGetter: (p) => convertDateTime(p.data.updated_at), headerName: "วันที่แก้ไข", minWidth: 200 },
    { field: "updated_by", headerName: "ชื่อที่แก้ไข", minWidth: 200 },
    {
      headerName: "ตัวเลือก",
      cellRenderer: ButtonCellRenderer,
      minWidth: 130,
      maxWidth: 130,
      pinned: "right",
      cellStyle: { display: "flex", justifyContent: "center", alignItems: "center", padding: 0 },
      sortable: false,
    },
  ];

  useEffect(() => {
    fetchAllContent();
    fetchAllPatientService();
  }, []);

  const fetchAllContent = async () => {
    setLoading(true);
    try {
      const res = await axiosApi.get("/setting/of", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      const data = res.data.data.map((r, i) => ({ ...r, numeric_id: i + 1 }));
      setRowData(data);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchAllPatientService = async () => {
    setLoading(true);
    try {
      const res = await axiosApi.get("/setting/pts", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`
        }
      })

      const data = res.data.data.map((r, i) => ({
        ...r,
        numeric_id: i + 1,
      }));
      setFetchPatient(data);
    } catch (err) {
      console.log(err)
    }
  }

  const hdlSubmit = async (body) => {

    if (editValues) return hdlUpdate(body);

    setLoadingAdd(true);
    try {
      const res = await axiosApi.post("/setting/of", body, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });

      if (res.status === 200) {
        addToast({ title: "สําเร็จ", description: res.data.message, timeout: 8000, color: "success", shouldShowTimeoutProgress: true });
        await fetchAllContent();
        setModalOpen(false);
        setEditValues(null);
      }
    } catch (err) {
      console.log(err);
      addToast({ title: "เกิดข้อผิดพลาด", description: err?.response?.data?.message ?? "ไม่ทราบสาเหตุ", timeout: 8000, color: "danger", shouldShowTimeoutProgress: true });
    } finally {
      setLoadingAdd(false);
    }
  };

  const hdlUpdate = async (body) => {
    setLoadingUpdate(true);
    try {
      const id = editValues?.overall_finding_id;
      const res = await axiosApi.put(`/setting/of/${id}`, body, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });

      if (res.status === 200) {
        addToast({ title: "สําเร็จ", description: res.data.message, timeout: 8000, color: "success", shouldShowTimeoutProgress: true });
        await fetchAllContent();
        setModalOpen(false);
        setEditValues(null);
      }
    } catch (err) {
      console.log(err);
      addToast({ title: "เกิดข้อผิดพลาด", description: err?.response?.data?.message ?? "ไม่ทราบสาเหตุ", timeout: 8000, color: "danger", shouldShowTimeoutProgress: true });
    } finally {
      setLoadingUpdate(false);
    }
  };

  const hdlDelete = async (id) => {
    setLoadingDelete(true);
    try {
      const res = await axiosApi.delete(`/setting/of/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });

      if (res.status === 200) {
        addToast({
          title: "สําเร็จ",
          description: res.data.message,
          timeout: 8000,
          color: "success",
          shouldShowTimeoutProgress: true,
          classNames: "text-white",
        });
        await fetchAllContent();
        setModalOpen(false);
        setEditValues(null);
      }
    } catch (err) {
      console.log(err);
      addToast({ title: "เกิดข้อผิดพลาด", description: err?.response?.data?.message ?? "ไม่ทราบสาเหตุ", timeout: 8000, color: "danger", shouldShowTimeoutProgress: true });
    } finally {
      setLoadingDelete(false);
    }
  };

  const deptOptions = useMemo(() => {
    return fetchPatinet?.map((el) => ({
      key: el.patient_service_id,
      label: `${el.patient_service_name_english} - ${el.patient_service_name_thai}`,
    }));
  }, [fetchPatinet]);

  const fields = useMemo(() => [
    {
      type: "select",
      name: "patient_service_id",
      label: "เลือกแผนก",
      required: true,
      placeholder: "เลือกแผนก",
      options: deptOptions,
      selectionMode: "single",
      disableWhenEdit: true,
      radius: "sm",
      className: "w-full mt-2",
    },
    {
      type: "text",
      name: "overall_finding_name",
      label: "ENG",
      placeholder: "เช่น การจัดเรียงเวชระเบียน....",
      required: true,
      radius: "sm",
    },
  ], [deptOptions]);

  return (
    <>
      {(loadingAdd || loadingDelete || loadingUpdate) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center dark:bg-black/80 bg-white/40 backdrop-blur-sm">
          <LoadingCenter title={ loadingAdd ? "กําลังเพิ่มข้อมูล..." : loadingDelete ? "กําลังลบข้อมูล..." : "กําลังอัพเดตข้อมูล..." } />
        </div>
      )}
      <ModalTextForm
        isOpen={modalOpen}
        onClose={() => { setModalOpen(false); setEditValues(null); }}
        onSubmit={hdlSubmit}
        loading={loadingAdd || loadingUpdate}
        title="Overall Findings"
        submitLabel={editValues ? "บันทึกการแก้ไข" : "บันทึก"}
        editData={editValues}
        fields={fields}
      />
      <div className="p-4 rounded-2xl border border-zinc-300 dark:border-[#505050] mb-4 bg-[#FAFAFB] dark:bg-[#181818]">
        <div className="flex justify-between">
          <div>
            <p className="font-medium">หัวข้อ Overal Finding</p>
          </div>
          <div className="flex items-center">
            <motion.button
              onClick={() => {
                setEditValues(null); // โหมดเพิ่ม
                setModalOpen(true);
              }}
              className="flex gap-0.5 items-center px-3 py-2 text-sm cursor-pointer bg-emerald-600 text-white rounded-lg hover:bg-emerald-500 dark:hover:bg-emerald-700"
              whileTap={{ scale: 0.98 }}>
              <ListFilterPlus size={18} />
              เพิ่มหัวข้อ
            </motion.button>
          </div>
        </div>
      </div>
      <div className="h-[calc(100vh-32.6vh)]">
        <AppDataGrid columnDefs={columnDefs} rowData={rowData} loading={loading} />
      </div>
    </>
  );
}
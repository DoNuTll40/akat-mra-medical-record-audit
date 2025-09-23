"use client";

import axiosApi from "@/config/axios-api";
import AuthenHook from "@/hooks/AuthenHook.mjs";
import { useEffect, useMemo, useState } from "react";
import makeCenteredCellStyle from "@/utils/markCellStyle";
import AppDataGrid from "@/components/table/AppDataGrid";
import { useTheme } from "next-themes";
import { motion } from "framer-motion";
import { convertDateTime } from "@/utils/convertDate";
import Ripple from "material-ripple-effects";
import { Popover, PopoverContent, PopoverTrigger } from "@heroui/popover";
import ModalTextForm from "@/components/modal/ModalTextForm";
import { ListFilterPlus } from "lucide-react";
import LoadingCenter from "@/components/loading";
import { addToast } from "@heroui/toast";

export default function page() {
  const { resolvedTheme } = useTheme();
  const [ mounted, setMounted ] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editValues, setEditValues] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingAdd, setLoadingAdd] = useState(false);
  const [loadingDelete, setLoadingDelete] = useState(false);
  const [loadingUpdate, setLoadingUpdate] = useState(false);
  const [rowData, setRowData] = useState([]);
  const [ fetchPatinet, setFetchPatient ] = useState([]);
  
  const ripple = new Ripple();
  useEffect(() => setMounted(true), []);

  const ButtonCellRenderer = (props) => {
    const handleClick = () => {
      // ค่าที่จะส่งไปให้ modal
      setEditValues({
        review_status_name: props.data?.review_status_name ?? "",
        review_status_description: props.data?.review_status_description,
        review_status_type: props.data?.review_status_type,
        patient_service_id: props.data?.patient_service_id,
        review_status_id: props.data?.review_status_id
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
            <p>กด "ยืนยัน" เพื่อลบหัวข้อ {props.data?.review_status_name ?? "-"} ออกจากระบบ</p>
            <motion.button
              className="w-full text-rose-700 font-semibold py-2 hover:bg-red-50 dark:hover:bg-rose-800 rounded-lg dark:bg-rose-700 dark:text-white cursor-pointer"
              onMouseUp={(e) => ripple.create(e)}
              onClick={() => hdlDelete(props.data?.review_status_id)}
            >ยืนยัน</motion.button>
          </PopoverContent>
        </Popover>
      </div>
    );
  };

  const columnDefs = [
    { field: "numeric_id", headerName: "ลำดับ", minWidth: 80, maxWidth: 80 },
    { field: "review_status_name", headerName: "หัวข้อ", minWidth: 350},
    { field: "review_status_description", headerName: "หัวข้อ", minWidth: 250},
    { 
      field: "review_status_type", 
      headerName: "สถานะ", 
      minWidth: 80,
      cellStyle: makeCenteredCellStyle({
        field: 'review_status_type',
        lockFn: (rowData, field) => rowData[field] === 'true',
        highlightWhen: 'false',
        highlightColor: mounted && resolvedTheme === "dark" ? '#303030' : '#D7D7D7',
      }),
    },
    {
      fields: "patient_group_name",
      headerName: "กลุ่มคนไข้",
      minWidth: 120,
      valueGetter: (params) => {
        return `${params.data?.patient_services?.patient_service_name_english} - ${params.data?.patient_services?.patient_service_name_thai}`
      }
    },
    { field: "created_at", valueGetter: (params) => convertDateTime(params.data.created_at), headerName: "วันที่สร้าง", minWidth: 200},
    { field: "created_by", headerName: "ชื่อที่สร้าง", minWidth: 150},
    { field: "updated_at", valueGetter: (params) => convertDateTime(params.data.updated_at), headerName: "วันที่แก้ไข", minWidth: 200},
    { field: "updated_by", headerName: "ชื่อที่แก้ไข", minWidth: 150},
    {
      headerName: 'ตัวเลือก',
      cellRenderer: ButtonCellRenderer,
      minWidth: 130,
      maxWidth: 130,
      pinned: 'right',
      cellStyle: { display: 'flex', justifyContent: 'center', alignItems: 'center', padding: 0 },
      sortable: false
    },
  ];

  useEffect(() => {
    fetchAllContent();
    fetchAllPatientService();
  }, [])

  const fetchAllContent = async () => {
    setLoading(true);
    try {
      const res = await axiosApi.get("/setting/rst", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`
        }
      })

      console.log(res.data)
      const data = res.data.data.map((r, i) => ({
        ...r,
        numeric_id: i + 1,
      }));
      setRowData(data);
      setLoading(false);
    } catch (err) {
      console.log(err)
      setLoading(false);
    }
  }

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

    if(editValues !== null){
      return hdlUpdate(body);
    }

    setLoadingAdd(true);
    try {
      const res = await axiosApi.post("/setting/rst", body, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`
        }
      })

      if(res.status === 200){
        addToast({ title: "สําเร็จ", description: res.data.message, timeout: 8000, color: "success", shouldShowTimeoutProgress: true, classNames: "text-white" });
        fetchAllContent();
        setModalOpen(false);
        setLoadingAdd(false);
        setEditValues(null);
      }
    } catch (err) {
      console.log(err)
      addToast({ title: "เกิดข้อผิดพลาด", description: err.response.data.message, timeout: 8000, color: "danger", shouldShowTimeoutProgress: true });
      setLoadingAdd(false);
    }
  }

  const hdlUpdate = async (body) => {
    setLoadingUpdate(true);
    try {
      const res = await axiosApi.put(`/setting/rst/${editValues.review_status_id}`, body, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`
        }
      })

      if(res.status === 200){
        addToast({ title: "สําเร็จ", description: res.data.message, timeout: 8000, color: "success", shouldShowTimeoutProgress: true, classNames: "text-white" });
        fetchAllContent();
        setModalOpen(false);
        setEditValues(null);
        setLoadingUpdate(false);
      }
    } catch (err) {
      console.log(err)
      addToast({ title: "เกิดข้อผิดพลาด", description: err.response.data.message, timeout: 8000, color: "danger", shouldShowTimeoutProgress: true });
      setLoadingUpdate(false);
    }
  }

  const hdlDelete = async (id) => {
    setLoadingDelete(true);
    try {
      const res = await axiosApi.delete(`/setting/rst/${id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`
        }
      })

      if(res.status === 200){
        addToast({ title: "สําเร็จ", description: res.data.message, timeout: 8000, color: "success", shouldShowTimeoutProgress: true, classNames: "text-white" });
        fetchAllContent();
        setModalOpen(false);
        setEditValues(null);
        setLoadingDelete(false);
      }
    } catch (err) {
      console.log(err)
      addToast({ title: "เกิดข้อผิดพลาด", description: err.response.data.message, timeout: 8000, color: "danger", shouldShowTimeoutProgress: true });
      setLoadingDelete(false);
    }
  }

  const deptOptions = useMemo(() => {
      return fetchPatinet?.map((el) => ({
        key: el.patient_service_id,
        label: `${el.patient_service_name_english} - ${el.patient_service_name_thai}`,
      }));
    }, [fetchPatinet]);
  
    const fields = useMemo(() => [
      {
        type: "text",
        name: "review_status_name",
        label: "ENG",
        placeholder: "เช่น การจัดเรียงเวชระเบียน....",
        required: true,
        radius: "sm",
      },
      {
        type: "text",
        name: "review_status_description",
        label: "ENG",
        placeholder: "เช่น การจัดเรียงเวชระเบียน....",
        required: true,
        radius: "sm",
      },
      { type: "checkbox", name: "review_status_type", label: "สถานะ", defaultValue: false },
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
    ], [deptOptions]);

  return (
    <>
      {(loadingAdd || loadingDelete || loadingUpdate) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center dark:bg-black/80 bg-white/40 backdrop-blur-sm">
          <LoadingCenter title={loadingAdd ? "กําลังเพิ่มข้อมูล..." : loadingDelete ? "กําลังลบข้อมูล..." : "กําลังอัพเดตข้อมูล..."} />
        </div>
      )}
      <ModalTextForm
        isOpen={modalOpen}
        onClose={() => { setModalOpen(false); setEditValues(null); }}
        onSubmit={hdlSubmit}
        loading={loadingAdd || loadingUpdate}
        title="Review Status"
        submitLabel={editValues ? "บันทึกการแก้ไข" : "บันทึก"}
        editData={editValues}
        fields={fields}
      />
      <div className="p-4 rounded-2xl border border-zinc-300 dark:border-[#505050] mb-4 bg-[#FAFAFB] dark:bg-[#181818]">
        <div className="flex justify-between">
          <div>
            <p className="font-medium">หัวข้อ Review Status</p>
            {/* <p className="text-xs text-rose-600 dark:text-rose-500 font-medium border-x-2 border-rose-600 pl-2 pr-6 py-1.5 bg-zinc-600/10">* ช่องข้อมูลที่มีการ ติ๊กถูก คือช่องที่จะต้องกรอกข้อมูลในแบบฟอร์ม</p> */}
          </div>
          <div className="flex items-center">
            <motion.button 
              onClick={() => setModalOpen(true)}
              className="flex gap-0.5 items-center px-3 py-2 text-sm cursor-pointer bg-emerald-600 text-white rounded-lg hover:bg-emerald-500 dark:hover:bg-emerald-700" 
              whileTap={{ scale: 0.98 }} >
                <ListFilterPlus size={18} />เพิ่มหัวข้อ
            </motion.button>
          </div>
        </div>
      </div>
      <div className="h-[calc(100vh-32.6vh)]">
        <AppDataGrid
          columnDefs={columnDefs}
          rowData={rowData}
          loading={loading}
          />
      </div>
    </>
  )
}

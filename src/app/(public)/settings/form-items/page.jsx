"use client";

import axiosApi from "@/config/axios-api";
import AuthenHook from "@/hooks/AuthenHook.mjs";
import { useEffect, useState } from "react";
import makeCenteredCellStyle from "@/utils/markCellStyle";
import AppDataGrid from "@/components/table/AppDataGrid";
import { useTheme } from "next-themes";
import { motion } from "framer-motion";
import { ListFilterPlus} from "lucide-react";
import ModalAddContentIteme from "@/components/modal/ModalAddContentIteme";
import { addToast } from "@heroui/toast";
import LoadingCenter from "@/components/loading";
import { Popover, PopoverContent, PopoverTrigger } from "@heroui/popover";
import Ripple from "material-ripple-effects";

export default function page() {
  const { resolvedTheme } = useTheme();
  const [ mounted, setMounted ] = useState(false);
  const [ loading, setLoading ] = useState(false);
  const [ loadingAdd, setLoadingAdd ] = useState(false);
  const [ loadingDelete, setLoadingDelete ] = useState(false);
  const [ loadingUpdate, setLoadingUpdate ] = useState(false);

  const ripple = new Ripple();

  const { token, authLoading } = AuthenHook();

  const [ modalOpen, setModalOpen ] = useState(false);
  const [ editValues, setEditValues ] = useState(null);

  const [fetchPatient, setFetchPatient] = useState([]);

  useEffect(() => setMounted(true), []);

  const [ rowData, setRowData ] = useState([]);

  const ButtonCellRenderer = (props) => {
    const handleClick = () => {
      setEditValues(props.data);
      setModalOpen(true);
    };

    return (
      <div className="flex gap-1 w-full justify-between items-center px-4">
        <button onClick={handleClick}>แก้ไข</button>
        <Popover showArrow backdrop="opaque" offset={10} placement="bottom-end">
          <PopoverTrigger>
            <motion.button className="text-rose-700 font-semibold cursor-pointer">
              ลบ
            </motion.button>
          </PopoverTrigger>
          <PopoverContent className="flex flex-col gap-2 p-4" >
            <p>กด "ยืนยัน" เพื่อลบหัวข้อ {props.data.content_of_medical_record_name} ออกจากระบบ</p>
            <motion.button className="w-full text-rose-700 font-semibold py-2 hover:bg-red-50 dark:hover:bg-rose-800 rounded-lg dark:bg-rose-700 dark:text-white cursor-pointer" onMouseUp={(e) => ripple.create(e)} onClick={() => hdlDelete(props.data.content_of_medical_record_id)}>ยืนยัน</motion.button>
          </PopoverContent>
        </Popover>
      </div>
    );
  };

  const hdlSubmit = async (data) => {

    if(editValues !== null){
      return hdlUpdate(data);
    }

    setLoadingAdd(true);
    try {
      const res = await axiosApi.post("/setting/comrc", data, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`
        }
      })
      if(res.status === 200){
        addToast({ title: "สําเร็จ", description: res.data.message, timeout: 8000, color: "success", shouldShowTimeoutProgress: true, classNames: "text-white" });
        setLoadingAdd(false);
        fetchAllContent();
        setModalOpen(false);
      }
    } catch (err) {
      console.log(err)
      addToast({ title: "เกิดข้อผิดพลาด", description: err.response.data.message, timeout: 8000, color: "danger", shouldShowTimeoutProgress: true });
      setLoadingAdd(false);
    }
  };

  const hdlUpdate = async (body) => {
    setLoadingUpdate(true);
    try {
      const res = await axiosApi.put(`/setting/comrc/${editValues.content_of_medical_record_id}`, body, {
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
      const res = await axiosApi.delete(`/setting/comrc/${id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`
        }
      })
      if(res.status === 200){
        addToast({ title: "สําเร็จ", description: res.data.message, timeout: 8000, color: "success", shouldShowTimeoutProgress: true, classNames: "text-white" });
        setLoadingDelete(false);
        fetchAllContent();
      }
    } catch (err) {
      console.log(err)
      addToast({ title: "เกิดข้อผิดพลาด", description: err.response.data.message, timeout: 8000, color: "danger", shouldShowTimeoutProgress: true });
      setLoadingDelete(false);
    }
  };

  const columnDefs = [
    { field: "numeric_id", headerName: "ลำดับ", minWidth: 80 },
    { field: "content_of_medical_record_name", 
      headerName: "หัวข้อ", 
      valueGetter: (params) => {
        return `${params.data.priority}.${params.data.content_of_medical_record_name}`},
      minWidth: 200, 
      suppressMenu: true,
      filter: true,
      floatingFilter: true, 
      suppressHeaderFilterButton: true,},
    {
      field: "patient_service_name_english",   // ตั้ง field แบบสั้นๆ ไป
      headerName: "แผนก (EN-TH)",
      minWidth: 130,
      suppressMenu: true,
      valueGetter: (params) => {
        const en = params.data?.patient_services?.patient_service_name_english ?? "";
        const th = params.data?.patient_services?.patient_service_name_thai ?? "";
        return [en, th].filter(Boolean).join(" - ");
      }
    },
    { field: "na_type", 
      headerName: "NA", 
      minWidth: 60, 
      cellStyle: makeCenteredCellStyle({
        field: 'na_type',
        lockFn: (rowData, field) => rowData[field] === 'true',
        // สมมติอยากไฮไลต์เฉพาะตอน "false" แทนก็เปลี่ยนเป็น 'false'
        highlightWhen: 'false',
        highlightColor: mounted && resolvedTheme === "dark" ? '#303030' : '#D7D7D7',
      })
    },
    { 
      field: "missing_type",
      headerName: "Missing",
      minWidth: 80,
      cellStyle: makeCenteredCellStyle({
        field: 'missing_type',
        lockFn: (rowData, field) => rowData[field] === 'true',
        // สมมติอยากไฮไลต์เฉพาะตอน "false" แทนก็เปลี่ยนเป็น 'false'
        highlightWhen: 'false',
        highlightColor: mounted && resolvedTheme === "dark" ? '#303030' : '#D7D7D7',
      }), 
    },
    { 
      field: "no_type",
      headerName: "No",
      minWidth: 60,
      cellStyle: makeCenteredCellStyle({
        field: 'no_type',
        lockFn: (rowData, field) => rowData[field] === 'true',
        // สมมติอยากไฮไลต์เฉพาะตอน "false" แทนก็เปลี่ยนเป็น 'false'
        highlightWhen: 'false',
        highlightColor: mounted && resolvedTheme === "dark" ? '#303030' : '#D7D7D7',
      }) 
    },
    ...Array.from({ length: 9 }, (_, i) => ({
      field: `criterion_number_${i + 1}_type`, 
      headerName: `เกณฑ์ ${i + 1}`, 
      minWidth: 80, 
      cellDataType: 'boolean',
      cellStyle: makeCenteredCellStyle({
        field: `criterion_number_${i + 1}_type`,
        lockFn: (rowData, field) => rowData[field] === 'true',
        // สมมติอยากไฮไลต์เฉพาะตอน "false" แทนก็เปลี่ยนเป็น 'false'
        highlightWhen: 'false',
        highlightColor: mounted && resolvedTheme === "dark" ? '#303030' : '#D7D7D7',
      }),
    })),
    {
      field: "points_deducted_type",
      headerName: "หักคะแนน",
      minWidth: 100,
      cellStyle: makeCenteredCellStyle({
        field: 'points_deducted_type',
        lockFn: (rowData, field) => rowData[field] === 'true',
        // สมมติอยากไฮไลต์เฉพาะตอน "false" แทนก็เปลี่ยนเป็น 'false'
        highlightWhen: 'false',
        highlightColor: mounted && resolvedTheme === "dark" ? '#303030' : '#D7D7D7',
      }),
    },
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
      const res = await axiosApi.get("/setting/comrc", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`
        }
      })

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

  return (
    <>
      {(loadingAdd || loadingDelete || loadingUpdate) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center dark:bg-black/80 bg-white/40 backdrop-blur-sm">
          <LoadingCenter title={loadingAdd ? "กําลังเพิ่มข้อมูล..." : loadingDelete ? "กําลังลบข้อมูล..." : "กําลังอัพเดตข้อมูล..."} />
        </div>
      )}
      <ModalAddContentIteme loading={loadingAdd} isOpen={modalOpen} fetchPatient={fetchPatient} onSubmit={hdlSubmit} onClose={() => setModalOpen(false)} editValues={editValues} setEditValues={setEditValues} />
      <div className="p-4 rounded-2xl border border-zinc-300 dark:border-[#505050] mb-4 bg-[#FAFAFB] dark:bg-[#181818]">
        <div className="flex justify-between">
          <div>
            <p className="font-medium">หัวข้อฟอร์ม</p>
            <p className="text-xs text-rose-600 dark:text-rose-500 font-medium border-x-2 border-rose-600 pl-2 pr-6 py-1.5 bg-zinc-600/10">* ช่องข้อมูลที่มีการ ติ๊กถูก คือช่องที่จะต้องกรอกข้อมูลในแบบฟอร์ม</p>
          </div>
          <div className="flex items-center">
            <motion.button 
              onClick={() => setModalOpen(true)}
              className="flex gap-0.5 items-center px-3 py-2 text-sm cursor-pointer bg-emerald-600 text-white rounded-md hover:bg-emerald-500 dark:hover:bg-emerald-700" 
              whileTap={{ scale: 0.98 }} >
                <ListFilterPlus size={18} />เพิ่มหัวข้อ
            </motion.button>
          </div>
        </div>
      </div>
      <div className="h-[calc(100vh-30vh)]">
        <AppDataGrid
          columnDefs={columnDefs}
          rowData={rowData}
          loading={loading}
        />
      </div>
    </>
  )
}
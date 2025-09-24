"use client";

import axiosApi from "@/config/axios-api";
import { useEffect, useState } from "react";
import AppDataGrid from "@/components/table/AppDataGrid";
import { motion } from "framer-motion";
import { convertDateTime } from "@/utils/convertDate";
import { ListFilterPlus, SquarePen, Trash2 } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@heroui/popover";
import ModalSystemUnit from "@/components/modal/ModalSystemUnit";
import { addToast } from "@heroui/toast";
import Ripple from "material-ripple-effects";
import LoadingCenter from "@/components/loading";
import Forbidden from "@/components/Forbidden";
import ButtonCellRenderer from "@/components/table/ButtonCellRenderer";

export default function page() {

  const [ modalOpen, setModalOpen ] = useState(false);
  const [ editValues, setEditValues ] = useState(null);
  const [ loading, setLoading ] = useState(false);
  const [ loadingAdd, setLoadingAdd ] = useState(false);
  const [ loadingDelete, setLoadingDelete ] = useState(false);
  const [ loadingUpdate, setLoadingUpdate ] = useState(false);

  const [ rowData, setRowData ] = useState([]);
  const [ token, setToken ] = useState(localStorage.getItem("token"));

  const ripple = new Ripple();

  if(localStorage.getItem("token") === null){
    return <Forbidden />
  }

  const columnDefs = [
    { field: "numeric_id", headerName: "ลำดับ", minWidth: 80, maxWidth: 80 },
    { field: "patient_service_name_english", headerName: "EN", minWidth: 200},
    { field: "patient_service_name_thai", headerName: "TH", minWidth: 200},
    { field: "created_at", valueGetter: (params) => convertDateTime(params.data.created_at), headerName: "วันที่สร้าง", minWidth: 200},
    { field: "created_by", headerName: "ชื่อที่สร้าง", minWidth: 200},
    { field: "updated_at", valueGetter: (params) => convertDateTime(params.data.updated_at), headerName: "วันที่แก้ไข", minWidth: 200},
    { field: "updated_by", headerName: "ชื่อที่แก้ไข", minWidth: 200},
    {
      headerName: 'ตัวเลือก',
      cellRenderer: (props) => ( 
        <ButtonCellRenderer 
          isEdit={setEditValues} 
          isOpenEdit={setModalOpen} 
          hdlDelete={hdlDelete} 
          data={props.data} 
          title={props.data.patient_service_name_english} 
          id={props.data.patient_service_id} 
        /> 
      ),
      minWidth: 130,
      maxWidth: 130,
      pinned: 'right',
      cellStyle: { display: 'flex', justifyContent: 'center', alignItems: 'center', padding: 0 },
      sortable: false
    },
  ];

  useEffect(() => {
    fetchAllContent();
  }, [])

  const fetchAllContent = async () => {
    setLoading(true);
    try {
      const res = await axiosApi.get("/setting/pts", {
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
      addToast({ title: "เกิดข้อผิดพลาด", description: err.response.data.message, timeout: 8000, color: "danger", shouldShowTimeoutProgress: true });
    }
  }

  const hdlSubmit = async (body) => {

    if(editValues !== null){
      return hdlUpdate(body);
    }

    setLoadingAdd(true);
    try {
      const res = await axiosApi.post("/setting/pts", body, {
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
      const res = await axiosApi.put(`/setting/pts/${editValues.patient_service_id}`, body, {
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
      const res = await axiosApi.delete(`/setting/pts/${id}`, {
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

  return (
    <>
      {(loadingAdd || loadingDelete || loadingUpdate) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center dark:bg-black/80 bg-white/40 backdrop-blur-sm">
          <LoadingCenter title={loadingAdd ? "กําลังเพิ่มข้อมูล..." : loadingDelete ? "กําลังลบข้อมูล..." : "กําลังอัพเดตข้อมูล..."} />
        </div>
      )}
      <ModalSystemUnit isOpen={modalOpen} onClose={() => setModalOpen(false)} onSubmit={hdlSubmit} fetchPatient={fetchAllContent} editValues={editValues} setEditValues={setEditValues} />
      <div className="p-4 rounded-2xl border border-zinc-300 dark:border-[#505050] mb-4 bg-[#FAFAFB] dark:bg-[#181818]">
        <div className="flex justify-between">
          <div>
            <p className="font-medium">หัวข้อฟอร์ม</p>
            {/* <p className="text-xs text-rose-600 dark:text-rose-500 font-medium border-x-2 border-rose-600 pl-2 pr-6 py-1.5 bg-zinc-600/10">* ช่องข้อมูลที่มีการ ติ๊กถูก คือช่องที่จะต้องกรอกข้อมูลในแบบฟอร์ม</p> */}
          </div>
          <div className="flex items-center">
            <motion.button 
              onClick={() => setModalOpen(true)}
              className="flex gap-0.5 items-center px-3 py-2 text-sm cursor-pointer bg-emerald-600 text-white rounded-full hover:bg-emerald-500 dark:hover:bg-emerald-700" 
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

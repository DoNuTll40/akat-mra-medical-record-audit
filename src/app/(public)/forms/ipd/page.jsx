"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { forbidden } from "next/navigation";
import LoadingCenter from "@/components/loading";
import AuthenHook from "@/hooks/AuthenHook.mjs";
import axiosApi from "@/config/axios-api";
import { Input } from "@heroui/input";
import AppDataGrid from "@/components/table/AppDataGrid";
import { useTheme } from "next-themes";
import { useIdleTimer } from "react-idle-timer";
import Ripple from "material-ripple-effects";
import moment from "moment/moment";
import { motion } from "framer-motion";
import { Checkbox } from "@heroui/checkbox";
import { Radio, RadioGroup } from "@heroui/radio";
import MRAFormIPD from "@/components/RenderForm/MRAFormIPD";
import { PDFViewer } from "@react-pdf/renderer";
import { addToast } from "@heroui/toast";
import ModalTextForm from "@/components/modal/ModalTextForm";
import maskANPretty from "@/utils/maskANPretty";

export default function Page() {
  const { resolvedTheme } = useTheme();
  const [ mounted, setMounted ] = useState(false);
  const { profile, token, authLoading } = AuthenHook();
  const [an, setAn] = useState("");
  const [hcode, setHcode] = useState({ hcode: "", hcode_name: "" });
  const [ rowData, setRowData ] = useState([]);
  const [ overallData, setOverallData ] = useState([]);
  const [ reviewStatus, setReviewStatus ] = useState(null);

  const [ loadingDelete, setLoadingDelete ] = useState(false);
  const [ loadingDataTable, setLoadingDataTable ] = useState(false);
  const [ loadingSubmit, setLoadingSubmit ] = useState(false);

  const [ formData, setFormData ] = useState({
    content: [],
    overall: [],
    review_status_id: null,
    review_status_result: null,
    review_status_comment: "",
  });

  const [ patientAn, setPatientAn ] = useState(null);

  const [ openModelDelete, setOpenModelDelete ] = useState(false);

  const [ generatePdf, setGeneratePdf ] = useState(false);

  const [pdfReady, setPdfReady] = useState(false);
  const [pdfData, setPdfData] = useState(null);
  const pdfRef = useRef();

  const inputRef = useRef(null); // เก็บตัวเก็บข้อมูลของ input

  const ripple = new Ripple();

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (authLoading) return;

    // ถ้าไม่มี token หรือชื่อว่าง ให้ forbidden แล้วหยุด
    if (!token || !profile?.fullname?.trim()) {
      forbidden();
      return;
    }

    fetchFormIPD(); // ถ้ามี function นี้จริงๆ
    fetchHcode();
    inputRef.current.focus();
  }, [authLoading, token, profile]);

  if (authLoading) {
    return <LoadingCenter />;
  }

  const onGridReady = useCallback((event) => {
    event.api.sizeColumnsToFit();
  }, []);

  const fetchHcode = async () => {
    const token = localStorage.getItem("token");
    try {
      const res = await axiosApi.get("/setting/hcode", {
        headers: { Authorization: `Bearer ${token}` },
      })

      if(res.status === 200){
        setHcode(res.data.data[0]);
      }
    } catch (err) {
      console.log(err)
    }
  }

  const fetchOnePatient = async (anKey) => {
    try {
      const res = await axiosApi.get(`mraIpd/fetchPatient/${anKey}`, {
        headers: { Authorization: `Bearer ${token}` }, // ใช้ token จาก hook
      });
      
      if (res.status === 200) {
        setPatientAn(res.data.data); // เก็บข้อมูลคนไข้จาก API นี้
        await generateForm(anKey);   // แล้วค่อยไปสร้างฟอร์ม
        addToast({ title: "สําเร็จ", description: res.data.message, timeout: 8000, color: "success", shouldShowTimeoutProgress: true });
      }

    } catch (err) {
      console.log(err);
      if (err?.response?.status === 409) {
        await generateForm(anKey);
        return;
      } else {
        addToast({ title: "เกิดข้อผิดพลาด", description: err.response.data.message, timeout: 8000, color: "danger", shouldShowTimeoutProgress: true });
      }
    }
  };

  const handleIdle = () => { // ฟังก์ชันสําหรับการหยุดพิมพ์
    if (an?.trim()) {
      fetchOnePatient(an);
    }
  };

  useIdleTimer({
    timeout: 1000, // 1000ms = หยุดพิมพ์
    onIdle: handleIdle, // ใช้ฟังก์ชัน handleIdle
    events: ["keyup"], // ใช้ keyup เท่านั้น
    element: inputRef.current, // ผูกกับ input
    immediateEvents: [], // ไม่ต้องรัน event อื่นทันที
  });

  const generateForm = async (anKey) => {
    setLoadingDataTable(true);
    try {
      const res = await axiosApi.post("/mraIpd", { 
        patient_an: anKey 
      },
      {
        headers: {
           Authorization: `Bearer ${token}` 
          }
        }
      );

      if (res.status === 200) {
        addToast({ title: "สําเร็จ", description: res.data.message, timeout: 8000, color: "success", shouldShowTimeoutProgress: true });
        const data = res.data.data;
        setRowData(data[0].form_ipd_content_of_medical_record_results);
        setOverallData(data[0].form_ipd_overall_finding_results);
        fetchReviewStatus();
        // แปลงโครงสร้างจริงของ data เป็น array หรือ object
        const p = (Array.isArray(data) ? data[0]?.patients : data?.patients) || {};
        setPatientAn({
          an: p.patient_an || "",
          hn: p.patient_hn || "",
          fullname: p.patient_fullname || "",
          regdate: p.patient_date_admitted || "",
          dcgdate: p.patient_date_discharged || "",
          ward_name: p.patient_ward || "",
        });

        setFormData((output) => ({
          ...output,
          content: data[0].form_ipd_content_of_medical_record_results.map((item) => {
            const {
              created_at,
              updated_at,
              created_by,
              updated_by,
              total_score,
              content_of_medical_records,
              ...rest
            } = item;

            const content_of_medical_record_id = content_of_medical_records?.content_of_medical_record_id;

            const converted = {
              content_of_medical_record_id,
            };

            for (const key in rest) {
              const value = rest[key];
              if (key === "comment") {
                converted[key] = value ?? null;
              } else if (key === "na" || key === "missing" || key === "no") {
                // na, missing, no คง true/false ตามเดิม
                converted[key] = !!value;
              } else {
                converted[key] =
                    typeof value === "boolean" ? (value ? 1 : 0)
                    : value == null ? 0  // สำหรับ null หรือ undefined
                  : value;
              }
            }

            return converted;
          }),
        }));
      }
    } catch (err) {
      console.log(err);
      if(err.response.status === 409) { // สำหรับข้อผิดพลาด 409
        hdlPreviewSubmit(); // ส่งข้อมูลไปยังฟังก์ชัน hdlPreviewSubmit
      } else {
        addToast({ title: "เกิดข้อผิดพลาด", description: err.response.data.message, timeout: 8000, color: "danger", shouldShowTimeoutProgress: true });
      }
    } finally {
      setLoadingDataTable(false);
    }
  };

  const fetchFormIPD = async () => {
    try {
      const res = await axiosApi.get("mraIpd", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`
        }
      })

      if(res.status === 200){
        console.log(res.data)
      }
    } catch (err) {
      console.log(err)
    }
  }

  const fetchReviewStatus = async () => {
    try {
      const res = await axiosApi.get("/mraIpd/rvst", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`
        }
      })

      if(res.status === 200){
        console.log(res.data)
        setReviewStatus(res.data.data);
      }
    } catch (err) {
      console.log(err)
    }
  }

  const hdlPreviewSubmit = async () => {
    setGeneratePdf(true);
    try {
      // 1. ดึงข้อมูล API (หรือใช้ข้อมูลที่มีใน state)
      const rs = await axiosApi.get(`/mraIpd/${an}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      }) // หรือรับจาก props

      const data = rs.data.data[0];
      if(rs.status === 200){
        setPdfReady(true);
        setPdfData(data);
        const p = (Array.isArray(data) ? data[0]?.patients : data?.patients) || {};
        setPatientAn({
          an: p.patient_an || "",
          hn: p.patient_hn || "",
          fullname: p.patient_fullname || "",
          regdate: p.patient_date_admitted || "",
          dcgdate: p.patient_date_discharged || "",
          ward_name: p.patient_ward || "",
        });
        setTimeout(() => {
          if (pdfRef.current) {
            pdfRef.current.focus();
          }
        }, 500);
      }
    } catch (err) {
      console.log(err);
    } finally {
      setGeneratePdf(false);
    }
  }

  const isRowLockedExceptSelf = (data, columnKey) => {
    // Lock เฉพาะถ้า current column ไม่ใช่ na, missing, no
    if (columnKey === 'na') return data?.missing || data?.no;
    if (columnKey === 'missing') return data?.na || data?.no;
    if (columnKey === 'no') return data?.na || data?.missing;
    // ทุกคอลัมน์อื่น ๆ — ถ้าค่าหนึ่งในนั้นติ๊กอยู่ ก็ lock
    return data?.na || data?.missing || data?.no;
  };

  const columnDefs = [
    { field: "content_of_medical_record_name", 
      headerName: "หัวข้อเวชระเบียน", 
      valueGetter: (params) => { // ฟังก์ชันสําหรับการดึงข้อมูล
        const index = params.node.rowIndex + 1; // ดึง index
        const name = params.data.content_of_medical_records // เช็คข้อมูลที่มีชื่อ content_of_medical_records
            ?.content_of_medical_record_name || ""; // ถ้าจริงก็ให้ดึงหัวข้อมา แต่ไม่มีก็ให้เป็น ""
        return `${index}.${name}`; // คืนค่าหัวข้อเวชระเบียน พร้อมกับตัวเลขตำแหน่งหน้าหัวข้อ
      },
      minWidth: 240, 
    },
    { field: "na", 
      editable: (params) => {
        return !isRowLockedExceptSelf(params.data, 'na') && params.data.content_of_medical_records?.na_type !== false;
      },
      headerName: "NA", 
      minWidth: 60,
      cellRenderer: "agCheckboxCellRenderer",
      cellEditor: "agCheckboxCellEditor",
      cellStyle: (params) => {
        if (isRowLockedExceptSelf(params.data, 'na') || params.data.content_of_medical_records?.na_type === false) {
          return {
            backgroundColor: mounted && resolvedTheme === "dark" ? '#303030' : '#D7D7D7',
            cursor: "not-allowed",
            userSelect: "none",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          };
        }
        return {
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        };
      },
    },
    { 
      field: "missing",
      headerName: "Missing",
      minWidth: 80,
      cellRenderer: "agCheckboxCellRenderer",
      cellEditor: "agCheckboxCellEditor",
      editable: (params) => {
        return !isRowLockedExceptSelf(params.data, 'missing') && params.data.content_of_medical_records?.missing_type !== false;
      },
      cellStyle: (params) => {
        if (isRowLockedExceptSelf(params.data, 'missing') || params.data.content_of_medical_records?.missing_type === false) {
          return {
            backgroundColor: mounted && resolvedTheme === "dark" ? '#303030' : '#D7D7D7',
            cursor: "not-allowed",
            userSelect: "none",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          };
        }
        return {
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        };
      },
    },
    { 
      field: "no",
      headerName: "No",
      minWidth: 60,
      cellRenderer: "agCheckboxCellRenderer",
      cellEditor: "agCheckboxCellEditor",
      cellDataType: "boolean",
      editable: (params) => {
        return !isRowLockedExceptSelf(params.data, 'no') && params.data.content_of_medical_records?.no_type !== false;
      },
      cellStyle: (params) => {
        if (isRowLockedExceptSelf(params.data, 'no') || params.data.content_of_medical_records?.no_type === false) {
          return {
            backgroundColor: mounted && resolvedTheme === "dark" ? '#303030' : '#D7D7D7',
            cursor: "not-allowed",
            userSelect: "none",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          };
        }
        return {
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        };
      },
    },
    ...Array.from({ length: 9 }, (_, i) => {
      const field = `criterion_number_${i + 1}`;          // ค่าจริง 0/1 เก็บคอลัมน์นี้
      const flagKey = `${field}_type`;                    // แฟลกสำหรับล็อก/ปิดการแก้ไข (boolean/0/1)

      return {
        field,
        headerName: `เกณฑ์ ${i + 1}`,
        minWidth: 80,
        cellRenderer: "agCheckboxCellRenderer",
        cellEditor: "agCheckboxCellEditor",
        cellDataType: "boolean",                           // ให้กริดรู้ว่าเป็น boolean

        editable: (params) => {
          const locked = isRowLockedExceptSelf?.(params.data, field);
          const disabledByFlag = params.data?.content_of_medical_records?.[flagKey] === false;
          return !locked && !disabledByFlag;
        },

        cellStyle: (params) => {
          const locked = isRowLockedExceptSelf?.(params.data, field);
          const disabledByFlag = params.data?.content_of_medical_records?.[flagKey] === false;

          if (locked || disabledByFlag) {
            return {
              backgroundColor: mounted && resolvedTheme === "dark" ? "#303030" : "#D7D7D7",
              cursor: "not-allowed",
              userSelect: "none",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            };
          }
          return {
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          };
        },

        // 0/1 -> true/false ให้ editor ใช้
        valueGetter: (params) => {
          const v = params.data?.[field];
          return v === 1; // ถ้าเป็น 1 คือ true ที่เหลือให้เป็น false ไป
        },

        // true/false -> 0/1 กลับเข้า data
        valueSetter: (params) => {
          params.data[field] = params.newValue ? 1 : 0;
          return true; // บอกกริดว่ามีการเปลี่ยนค่าแล้ว
        },
      };
    }),
    {
      field: "points_deducted",
      headerName: "หักคะแนน",
      minWidth: 90,
      cellRenderer: "agCheckboxCellRenderer",
      cellEditor: "agCheckboxCellEditor",
      editable: (params) => {
        return !isRowLockedExceptSelf(params.data, 'points_deducted') && params.data.content_of_medical_records?.points_deducted_type !== false;
      },
      cellStyle: (params) => {
        if (isRowLockedExceptSelf(params.data, 'points_deducted') || params.data.content_of_medical_records?.points_deducted_type === false) {
          return {
            backgroundColor: mounted && resolvedTheme === "dark" ? '#303030' : '#D7D7D7',
            cursor: "not-allowed",
            userSelect: "none",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          };
        }
        return {
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        };
      },
    },
    { field: "comment", 
      headerName: "หมายเหตุ",
      minWidth: 220, 
      editable: true,
    },
  ];

  const hdlCellValueChanged = (event) => {
    event.api.refreshCells({ rowNodes: [event.node], force: true });

    const updatedData = []; // สร้างตัวแปรสําหรับเก็บข้อมูล

    event.api.forEachNode((node) => { // วนลูปใน AGGrid
      updatedData.push(node.data); // เพิ่มข้อมูลใน node.data ไปยัง updatedData
    }); // วนลูปใน AGGrid

    setFormData((output) => ({
      ...output,
      content: updatedData.map((item) => {
        const {
          created_at,
          updated_at,
          created_by,
          updated_by,
          total_score,
          content_of_medical_records,
          ...rest
        } = item;

        const content_of_medical_record_id = content_of_medical_records?.content_of_medical_record_id;

        const converted = {
          content_of_medical_record_id,
        };

        for (const key in rest) {
          const value = rest[key];
          if (key === "comment") {
            converted[key] = value ?? null;
          } else if (key === "na" || key === "missing" || key === "no") {
            // na, missing, no คง true/false ตามเดิม
            converted[key] = !!value;
          } else {
            converted[key] =
                typeof value === "boolean" ? (value ? 1 : 0)
                : value == null ? 0  // สำหรับ null หรือ undefined
              : value;
          }
        }

        return converted;
      }),
    }));
  }

  const onSubmit = async () => {
    let token = localStorage.getItem("token");
    try {
      const res = await axiosApi.put(`/mraIpd/${an}`, formData, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })

      if(res.status === 200){
        console.log(res.data)
        fetchOnePatient(an);
      }
    } catch (err) {
      console.log(err)
    }
  }

  // อัปเดต state แบบ upsert ตาม overall_finding_id
  const hdlChangeCheckbox = (checked, item) => {
    const id = item?.overall_finding?.overall_finding_id ?? item?.overall_finding_id;
    const resultId = item?.form_ipd_overall_finding_result_id ?? null;
    if (!id) return;

    // ค่าเดิมที่โหลดมา (treat อะไรที่ไม่ใช่ true ให้เป็น false)
    const original = item?.overall_finding_result === true;

    setFormData(prev => {
      const next = [...prev.overall];
      const i = next.findIndex(x => x.overall_finding_id === id);

      if (i > -1) {
        // เคยอยู่ใน diff แล้ว
        if (checked === original) {
          // กลับสู่ค่าเดิม ลบออก ไม่ต้องส่ง
          next.splice(i, 1);
        } else {
          // ยังต่างจากเดิม แก้ค่าต่อไป
          next[i] = {
            ...next[i],
            overall_finding_result: checked,
            form_ipd_overall_finding_result_id:
              next[i].form_ipd_overall_finding_result_id ?? resultId,
          };
        }
      } else {
        // ยังไม่ได้อยู่ใน diff
        if (checked !== original) {
          // ต่างจากค่าเดิม ค่อย push เข้า diff
          next.push({
            form_ipd_overall_finding_result_id: resultId,
            overall_finding_id: id,
            overall_finding_result: checked,
          });
        }
        // ถ้าเท่ากับค่าเดิม ก็ไม่ต้องทำอะไร
      }
      return { ...prev, overall: next };
    });
  };

  const hdlChangeReviewStatus = (value) => {
    const rvs = reviewStatus?.find(e => e.review_status_id === value)
    setFormData(prev => ({
      ...prev, 
      review_status_id: rvs.review_status_id,
      review_status_result: true,
      review_status_comment: rvs.review_status_comment
    }))
  }

  const hdlClear = () => {
    setFormData(prev => ({
      ...prev, 
      content: [],
      overall: [],
      review_status_id: null,
      review_status_result: null,
      review_status_comment: ""
    }))
  }

  const memoizedPdf = useMemo(() => (
    <PDFViewer ref={pdfRef} key={an} width="100%" height="100%" showToolbar>
      <MRAFormIPD {...pdfData}  />
    </PDFViewer>
  ), [an, pdfData]);

  const hdlDelete = async ( output ) => {
    setLoadingDelete(true);
    if (output.patient_an !== an) {
      return addToast({ title: "เกิดข้อผิดพลาด", description: "หมายเลข AN ไม่ถูกต้อง", timeout: 8000, color: "danger", shouldShowTimeoutProgress: true });
    }

    const body = { password: output.password };

    try {
      const res = await axiosApi.delete(`/mraIpd/${output.patient_an}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`
        }, data: body })

      if(res.status === 200){
        addToast({ title: "สําเร็จ", description: res.data.message, timeout: 8000, color: "success", shouldShowTimeoutProgress: true });
        hdlClear();
        setAn("");
        setPatientAn(null);
        setPdfData({});
        setPdfReady(false);
        setRowData([]);
        setOpenModelDelete(false);
      }

    } catch (err) {
      console.log(err)
      addToast({ title: "เกิดข้อผิดพลาด", description: err.response.data.message, timeout: 8000, color: "danger", shouldShowTimeoutProgress: true });
    } finally {
      setLoadingDelete(false);
    }
  }

  const field = [
    {
      type: "text",
      name: "patient_an",
      label: "กรอกหมายเลข AN",
      placeholder: "XXXXXXXXX",
      required: true,
      radius: "sm",
    },
    {
      type: "password",
      name: "password",
      label: "กรอกรหัสผ่าน",
      placeholder: "••••••••",
      required: true,
      radius: "sm",
    },
  ]

  return (
    <>
    {(loadingDelete) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center dark:bg-black/80 bg-white/40 backdrop-blur-sm">
          <LoadingCenter title={loadingDelete && "กําลังลบข้อมูล..."} />
        </div>
      )}
      <ModalTextForm isOpen={openModelDelete} onClose={() => setOpenModelDelete(false)} delModal={true} title={`คุณต้องการลบข้อมูล ${maskANPretty(an, { keepStart: 2, keepEnd: 2 })}`} onSubmit={hdlDelete} fields={field} />
      <div className="select-none rounded-2xl border border-zinc-300 dark:border-[#505050] mb-4 bg-[#FAFAFB] dark:bg-[#181818] shadow-lg">
        <p className="font-medium border-b border-zinc-300 dark:border-[#505050] p-4">แบบตรวจประเมินคุณภาพการบันทึกเวชระเบียนผู้ป่วยใน Medical Record Audit Form (IPD) {patientAn && `| ${patientAn.ward_name}`}</p>
        <div className="p-4 flex flex-col gap-2">
          <div className="flex gap-2">
            <Input variant="bordered" radius="md" label="รหัสสถานพยาบาล" size="md" placeholder="XXXXX" value={hcode ? hcode.hcode : ""} labelPlacement="outside-top" isReadOnly />
            <Input variant="bordered" radius="md" label="ชื่อสถานพยาบาล" size="md" placeholder="โรงพยาบาล....." value={hcode ? hcode.hcode_name : ""} labelPlacement="outside-top" isReadOnly />
          </div>
          <Input variant="bordered" radius="md" label="ชื่อ-สกุล" size="md" placeholder="ชื่อ-สกุล" value={patientAn ? patientAn.fullname : ""} labelPlacement="outside-top" isDisabled />
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-5 gap-2">
            <Input 
              ref={inputRef}
              value={an}
              onChange={(e) => {
                setAn(e.target.value);
                setPatientAn(null);
                setRowData([]);
                setOverallData([]);
                setPdfReady(false);
                setPdfData(null);
                hdlClear();
              }}
              variant="bordered"
              radius="md"
              label="AN"
              size="md"
              placeholder="AN"
              labelPlacement="outside-top"
              maxLength={9}
            />
            <Input variant="bordered" radius="md" label="HN" size="md" placeholder="HN" value={patientAn ? patientAn.hn : ""} labelPlacement="outside-top" isDisabled />
            <Input variant="bordered" radius="md" label="วันที่เข้ารับบริการ" size="md" placeholder="Date admitted" value={patientAn ? moment(patientAn?.regdate).add(543, "years").format("DD/MM/YYYY"): ""} labelPlacement="outside-top" isDisabled />
            <Input variant="bordered" radius="md" label="วันที่สิ้นสุด" size="md" placeholder="Date discharged" value={patientAn ? moment(patientAn?.dchdate).add(543, "years").format("DD/MM/YYYY"): ""} labelPlacement="outside-top" isDisabled />
            <div className="flex flex-col items-center w-full h-full">
              <div className="flex items-center justify-between w-full">
                <p className="text-sm mb-2">ตัวเลือก</p>
              </div>
              <div className="w-full items-center">
                <motion.button onClick={() => setOpenModelDelete(true)} disabled={!pdfReady} className="w-full text-sm text-center text-rose-700 font-semibold px-6 py-2 hover:bg-red-50 dark:hover:bg-rose-800 rounded-xl dark:bg-rose-700 dark:text-white cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed" >ลบข้อมูล</motion.button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {!pdfReady &&
        <div className="h-[calc(100vh-15vh)] shadow-lg rounded-2xl">
          <AppDataGrid
            columnDefs={columnDefs}
            rowData={rowData}
            loading={loadingDataTable}
            pagination={false}
            onCellValueChanged={hdlCellValueChanged}
            onGridReady={onGridReady}
          />
        </div>
      }

      {rowData.length > 0 && !pdfReady &&
        <>
          <hr className="mt-8 mb-6" />
          <p className="underline underline-offset-2 select-none">ประเมินคุณภำพกำรบันทึกเวชระเบียนในภาพรวม</p>
          <div className="flex items-start gap-2 py-2">
            <p className="font-semibold w-[130px] text-sm">Overall Finding</p>
            <div className="flex flex-col gap-2">
              {overallData.length > 0 && overallData.map((e, index) => (
                <Checkbox size="sm" key={index} value={e.overall_finding_result} defaultSelected={overallData ? e.overall_finding_result : false} onValueChange={(value) => hdlChangeCheckbox(value, e) } label="ไม่ต้องการบันทึก" radius="full">{e.overall_finding.overall_finding_name}</Checkbox>
              ))}
            </div>
          </div>

          <div className="flex items-start gap-2 py-2 select-none">
            <p className="font-semibold w-[130px] text-sm">(เลือกเพียง 1 ข้อ)</p>
            <div className="flex flex-col gap-4">
              <RadioGroup onValueChange={(value) => hdlChangeReviewStatus(value)} >
                {reviewStatus?.length > 0 && reviewStatus?.map((e) => (
                  <Radio size="sm" value={e.review_status_id} key={e.review_status_id}>{e.review_status_name} ({e.review_status_description})</Radio>
                ))}
              </RadioGroup>
              {reviewStatus && reviewStatus?.find(e => e.review_status_id === formData.review_status_id)?.review_status_type === true && (
                <Input onValueChange={(value) => setFormData(prev => ({ ...prev, review_status_comment: value }))} variant="bordered" labelPlacement="outside" radius="md" label="อื่นๆ" placeholder="อื่นๆ" value={formData.review_status_comment } />
              )}
            </div>
          </div>
        </>
      }

      { generatePdf && 
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="z-50 fixed inset-0 w-full h-dvh flex items-center justify-center backdrop-blur-xs">
          <LoadingCenter title="กําลังสร้าง PDF..." />
        </motion.div> 
      }

       {pdfReady && (
        <div className="w-full h-[calc(100vh-15vh)] overflow-hidden rounded-2xl my-2 shadow-lg">
          {pdfData && memoizedPdf}
        </div>      
      )}

      { formData.review_status_id && !pdfReady && (
        <motion.button
          onClick={onSubmit}
          className="w-full mt-4 text-emerald-700 font-semibold py-2 hover:bg-red-50 dark:hover:bg-emerald-800 rounded-xl dark:bg-emerald-700 dark:text-white cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
          onMouseUp={(e) => ripple.create(e)}
          disabled={generatePdf}
        >{generatePdf ? "กำลังบันทึกข้อมูล" : "บันทึก"}</motion.button>
      )}
    </>
  );
}
import Ripple from "material-ripple-effects";
import { motion } from "framer-motion";
import { Checkbox, CheckboxGroup } from "@heroui/checkbox";
import { useEffect, useMemo, useState } from "react";
import { ListFilterPlus, X } from "lucide-react";
import { Select, SelectItem } from "@heroui/select";
import { Input } from "@heroui/input";

const CRITERIA_KEYS = [
  "na_type","missing_type","no_type",
  ...Array.from({length: 9}, (_,i)=>`criterion_number_${i+1}_type`),
  "points_deducted_type"
];

function CriteriaGroup({ value, onChange }) {
  // value เป็น Set ของคีย์ที่เลือก
  const allSelected = CRITERIA_KEYS.every(k => value.has(k));
  const someSelected = !allSelected && CRITERIA_KEYS.some(k => value.has(k));

  const toggleAll = () => {
    onChange(new Set(allSelected ? [] : CRITERIA_KEYS));
  };

  return (
    <div className="mt-3 text-sm">
      <div className="flex items-center justify-between mb-2">
        <p className="font-semibold underline hidden sm:block">ตัวเลือกเงื่อนไข</p>
        <Checkbox
          isSelected={allSelected}
          isIndeterminate={someSelected}
          onChange={toggleAll}
          aria-label="เลือก/ยกเลิกทั้งหมด"
          size="sm"
        >
          เลือกทั้งหมด
        </Checkbox>
      </div>

      <CheckboxGroup
        aria-label="เลือกเงื่อนไขของหัวข้อ"
        value={Array.from(value)}
        onChange={(arr) => onChange(new Set(arr))}
      >
        <div className="grid gap-2 grid-cols-1 xs:grid-cols-2 sm:grid-cols-3">
          <Checkbox value="na_type" size="sm">NA</Checkbox>
          <Checkbox value="missing_type" size="sm">Missing</Checkbox>
          <Checkbox value="no_type" size="sm">No</Checkbox>
        </div>

        <div className="grid gap-2 grid-cols-1 xs:grid-cols-2 sm:grid-cols-3">
          {Array.from({length: 9}, (_,i)=>(
            <Checkbox key={i} value={`criterion_number_${i+1}_type`} size="sm">
              เกณฑ์ {i+1}
            </Checkbox>
          ))}
        </div>

        <Checkbox value="points_deducted_type" size="sm">หักคะแนน</Checkbox>
      </CheckboxGroup>
      <p className="mt-2 text-xs text-zinc-500">
        ช่องที่ติ๊กถูก จะไปแสดงเป็นคอลัมน์ที่ต้องกรอกในตารางตรวจบันทึกเวชระเบียน
      </p>
    </div>
  );
}

export default function ModalAddContentIteme({ isOpen, onClose, fetchPatient, onSubmit, loading, editValues, setEditValues }) {
  const [input, setInput] = useState("");
  const [criteria, setCriteria] = useState(new Set());
  const [selectedKeys, setSelectedKeys] = useState(new Set());
  const selectedId = useMemo(() => Array.from(selectedKeys)[0] ?? "", [selectedKeys]);
  
  const payload = useMemo(() => {
    const obj = {};
    for (const k of CRITERIA_KEYS) obj[k] = criteria.has(k);
    return obj;
  }, [criteria]);

  useEffect(() => {
    if (!isOpen) return;
    if (editValues) {
      setInput(editValues.content_of_medical_record_name ?? "");
      setSelectedKeys(
        editValues.patient_services?.patient_service_id
          ? new Set([String(editValues.patient_services.patient_service_id)])
          : new Set()
      );
      // แปลง boolean fields -> Set ของ key ที่ true
      setCriteria(new Set(CRITERIA_KEYS.filter(k => !!editValues[k])));
    } else {
      setInput("");
      setSelectedKeys(new Set());
      setCriteria(new Set());
    }
  }, [isOpen, editValues]);

  if (!isOpen) return null;
  
  const ripple = new Ripple();

  const handleSubmit = async (e) => {
    e.preventDefault();

    const body = { content_of_medical_record_name: input,  ...payload };

    return onSubmit(body);
  };

  const isEdit = !!editValues;
  const title = isEdit ? "แก้ไขหัวข้อฟอร์ม" : "เพิ่มหัวข้อฟอร์ม";
  const submitText = loading ? "กำลังบันทึก..." : isEdit ? "บันทึกการแก้ไข" : "บันทึก";

  const hdlCloseModal = () => {
    onClose();
    setInput("");
    setSelectedKeys(new Set());
    setCriteria(new Set());
    setEditValues(null);
  }

  return (
    <motion.div
      className="fixed inset-0 z-40 flex items-center justify-center bg-black/20 backdrop-blur-sm px-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onMouseDown={(e) => { e.target === e.currentTarget && hdlCloseModal(); }}
      >
      <motion.form
        initial={{ opacity: 0, scale: 0.9, y: 40 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 40 }}
        transition={{ duration: 0.2, ease: "easeOut" }}
        onSubmit={handleSubmit}
        className="bg-white dark:bg-[#181818] w-full max-w-lg rounded-2xl shadow-xl border border-zinc-200 dark:border-zinc-700"
        onMouseDown={(e) => { e.target === e.currentTarget && hdlCloseModal(); }}
      >
        {/* header */}
        <div className="flex justify-between items-center border-b border-zinc-200 dark:border-zinc-700 px-4 py-2">
          <h2 className="text-md font-semibold text-zinc-900 dark:text-zinc-100 flex gap-1">
            <ListFilterPlus /> {title}
          </h2>
          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={hdlCloseModal}
            onMouseUp={(e) => ripple.create(e)}
            className="p-1.5 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer"
          >
            <X className="w-5 h-5 text-zinc-600 dark:text-zinc-400" />
          </motion.button>
        </div>

        {/* body */}
        <div className="flex flex-col gap-2 max-h-[60vh] overflow-y-auto px-6 py-4">
          <Input 
            radius="sm"
            isRequired
            label="ชื่อหัวข้อ"
            labelPlacement="outside-top" 
            placeholder="เช่น Consultation Record"
            onValueChange={(value) => setInput(value)}
            // isDisabled={editValues !== null}
            value={input}
          />

          <Select
            selectionMode="single"
            selectedKeys={selectedKeys}
            onSelectionChange={setSelectedKeys}
            disableSelectorIconRotation
            className="w-full mt-2"
            radius="sm"
            labelPlacement="outside"
            placeholder="เลือกแผนก"
            isRequired
            label="เลือกแผนก"
            isDisabled={editValues !== null}
          >
            {fetchPatient?.map((el) => (
              <SelectItem key={el.patient_service_id}>{`${el.patient_service_name_english} - ${el.patient_service_name_thai}`}</SelectItem>
            ))}
          </Select>

          <CriteriaGroup value={criteria} onChange={setCriteria} />
        </div>

        {/* footer */}
        <div className="flex justify-end gap-2 border-t border-zinc-200 dark:border-zinc-700 px-4 py-2">
          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={hdlCloseModal}
            onMouseUp={(e) => ripple.create(e, "dark")}
            className="cursor-pointer px-4 py-2 rounded-md text-sm bg-zinc-200 hover:bg-zinc-300 dark:bg-zinc-700 dark:hover:bg-zinc-600 text-zinc-800 dark:text-zinc-100"
          >
            ยกเลิก
          </motion.button>
          <motion.button 
            whileTap={{ scale: 0.98 }} 
            type="submit" 
            className="cursor-pointer px-8 py-2 rounded-md text-sm bg-emerald-600 hover:bg-emerald-500 text-white disabled:opacity-50 disabled:cursor-not-allowed"
            onMouseUp={(e) => ripple.create(e, "dark")}
            disabled={loading}
          >
            {loading ? "กําลังบันทึก..." : `${submitText}` }
          </motion.button>
        </div>
      </motion.form>
    </motion.div>
  );
}

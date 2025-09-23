import Ripple from "material-ripple-effects";
import { motion } from "framer-motion";
import { useEffect,  useState } from "react";
import { ListFilterPlus, X } from "lucide-react";
import { Select, SelectItem } from "@heroui/select";
import { Input } from "@heroui/input";

export default function ModalSystemUnit({ isOpen, onClose, fetchPatient, onSubmit, loading, editValues, setEditValues }) {
  const [input, setInput] = useState({ patient_service_name_thai: "", patient_service_name_english: "" });

  useEffect(() => {
    if (!isOpen) return;
    if (editValues) {
      setInput({ patient_service_name_thai: editValues.patient_service_name_thai, patient_service_name_english: editValues.patient_service_name_english });
    } else {
      setInput({  patient_service_name_thai: "", patient_service_name_english: "" });
    }
  }, [isOpen, editValues]);

  if (!isOpen) return null;
  
  const ripple = new Ripple();

  const handleSubmit = async (e) => {
    e.preventDefault();
    return onSubmit(input);
  };

  const isEdit = !!editValues;
  const title = isEdit ? "แก้ไข" : "เพิ่ม";
  const submitText = loading ? "กำลังบันทึก..." : isEdit ? "บันทึกการแก้ไข" : "บันทึก";

  const hdlCloseModal = () => {
    setInput({ patient_service_name_thai: "", patient_service_name_english: "" });
    onClose();
    setEditValues(null);
  }

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/20 backdrop-blur-sm px-4">
      <motion.form
        initial={{ opacity: 0, scale: 0.9, y: 40 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 40 }}
        transition={{ duration: 0.2, ease: "easeOut" }}
        onSubmit={handleSubmit}
        className="bg-white dark:bg-[#181818] w-full max-w-lg rounded-2xl shadow-xl border border-zinc-200 dark:border-zinc-700"
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
            label="ENG"
            labelPlacement="outside-top" 
            placeholder="เช่น IPD"
            onValueChange={(value) => setInput({  ...input, patient_service_name_english: value })}
            value={input.patient_service_name_english}
          />
          <Input 
            radius="sm"
            isRequired
            label="THAI"
            labelPlacement="outside-top" 
            placeholder="เช่น ผู้ป่วยใน"
            onValueChange={(value) => setInput({ ...input, patient_service_name_thai: value })}
            value={input.patient_service_name_thai}
          />
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
    </div>
  );
}

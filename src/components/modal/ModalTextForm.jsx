"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Ripple from "material-ripple-effects";
import { ListFilterPlus, ListMinus, Save, X } from "lucide-react";
import { Input } from "@heroui/input";
import { Select, SelectItem } from "@heroui/select";
import { Checkbox, CheckboxGroup } from "@heroui/checkbox";

/**
 * ModalForm (v3) — รองรับ text | select | checkbox | checkbox-group
 *
 * Props:
 * - isOpen, onClose, onSubmit, loading, title, submitLabel, editData, delModal
 * - fields: Array<{
 *    - type: "text" | "select" | "checkbox" | "checkbox-group",
 *    - name: string,
 *    - label?: string,                 // text/select/checkbox-group ใช้เป็นหัวข้อ; checkbox เดี่ยวใช้เป็นข้อความข้างกล่อง
 *    - placeholder?: string,           // text/select
 *    - required?: boolean,
 *    - defaultValue?: string | boolean | string[], // ขึ้นกับ type
 *    - radius?: "sm"|"md"|"lg",
 *    - className?: string,
 *    - disableWhenEdit?: boolean,      // ล็อกตอนแก้ไข
 *    - // select / checkbox-group
 *    - options?: Array<{ key: string | number, label: string }>
 *   }>
 */
export default function ModalTextForm({
  isOpen,
  onClose,
  onSubmit,
  loading = false,
  title = "ฟอร์ม",
  submitLabel = "บันทึก",
  editData = null,
  fields = [],
  delModal = false
}) {
  const [values, setValues] = useState({});
  const ripple = new Ripple();

  // สร้างค่าเริ่มต้นจาก fields + editData
  function buildValues(fields, data) {
    const obj = {};
    for (const f of fields) {
      const incoming = data?.[f.name];
      if (f.type === "checkbox") {
        obj[f.name] = typeof incoming === "boolean"
          ? incoming
          : typeof f.defaultValue === "boolean"
          ? f.defaultValue
          : false;
      } else if (f.type === "checkbox-group") {
        // ควรเป็น array ของค่า key
        obj[f.name] = Array.isArray(incoming)
          ? incoming
          : Array.isArray(f.defaultValue)
          ? f.defaultValue
          : [];
      } else {
        // text / select เป็น string
        obj[f.name] = (incoming ?? f.defaultValue ?? "") + "";
      }
    }
    return obj;
  }

  // ตั้งค่าฟอร์มทุกครั้งที่เปิด
  useEffect(() => {
    if (!isOpen) return;
    setValues(buildValues(fields, editData));
  }, [isOpen, editData, fields]);

  if (!isOpen) return null;

  const isEdit = !!editData;
  const computedSubmitText = loading
    ? "กำลังบันทึก..."
    : submitLabel || (isEdit ? "บันทึกการแก้ไข" : "บันทึก");

  // text input
  const hdlChange = (name) => (val) => {
    setValues((prev) => ({ ...prev, [name]: val }));
  };

  // select single (HeroUI คืน Set)
  const hdlSelectChange = (name) => (keys) => {
    const first = Array.from(keys)[0] ?? "";
    setValues((prev) => ({ ...prev, [name]: first }));
  };

  // checkbox เดี่ยว (HeroUI คืน boolean)
  const hdlCheckbox = (name) => (isSelected) => {
    setValues((prev) => ({ ...prev, [name]: !!isSelected }));
  };

  // checkbox กลุ่ม (HeroUI คืน array ของค่าเลือก)
  const hdlCheckboxGroup = (name) => (arr) => {
    setValues((prev) => ({ ...prev, [name]: Array.isArray(arr) ? arr : [] }));
  };

  const hdlSubmit = (e) => {
    e.preventDefault();
    onSubmit(values);
  };

  const hdlClose = () => {
    setValues(buildValues(fields, null));
    onClose?.();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-40 flex items-center justify-center bg-black/20 backdrop-blur-sm px-4"
      onMouseDown={(e) => { e.target === e.currentTarget && hdlClose(); }}
    >
      <motion.form
        initial={{ opacity: 0, scale: 0.9, y: 40 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 40 }}
        transition={{ duration: 0.2, ease: "easeOut" }}
        onSubmit={hdlSubmit}
        className="bg-white dark:bg-[#181818] w-full max-w-lg rounded-2xl shadow-xl border border-zinc-200 dark:border-zinc-700"
      >
        {/* Header */}
        <div className="flex justify-between items-center border-b border-zinc-200 dark:border-zinc-700 px-4 py-2">
          <h2 className="text-md font-semibold text-zinc-900 dark:text-zinc-100 flex gap-1 items-center">
            {!delModal ? <ListFilterPlus className="w-5 h-5" /> : <ListMinus className="w-5 h-5" />}
            {!delModal ? isEdit ? `แก้ไข ${title}` : `เพิ่ม ${title}` : `ลบข้อมูล ${title}`}
          </h2>
          <motion.button
            type="button"
            whileTap={{ scale: 0.98 }}
            onClick={hdlClose}
            onMouseUp={(e) => ripple.create(e)}
            className="p-1.5 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer"
          >
            <X className="w-5 h-5 text-zinc-600 dark:text-zinc-400" />
          </motion.button>
        </div>

        {/* Body */}
        <div className="flex flex-col gap-3 max-h-[60vh] overflow-y-auto px-6 py-4">
          {fields.map((f) => {
            // SELECT
            if (f.type === "select") {
              return (
                <Select
                  key={f.name}
                  selectionMode="single"
                  selectedKeys={values[f.name] ? new Set([String(values[f.name])]) : new Set()}
                  onSelectionChange={hdlSelectChange(f.name)}
                  disableSelectorIconRotation
                  className={f.className ?? "w-full mt-2"}
                  radius={f.radius ?? "sm"}
                  labelPlacement="outside"
                  placeholder={f.placeholder ?? "โปรดเลือก"}
                  isRequired={!!f.required}
                  label={f.label}
                  isDisabled={!!f.disableWhenEdit && isEdit}
                >
                  {(f.options ?? []).map((opt) => (
                    <SelectItem key={String(opt.key)}>{opt.label}</SelectItem>
                  ))}
                </Select>
              );
            }

            // CHECKBOX GROUP
            if (f.type === "checkbox-group") {
              return (
                <CheckboxGroup
                  key={f.name}
                  label={f.label}
                  value={Array.isArray(values[f.name]) ? values[f.name] : []}
                  onValueChange={hdlCheckboxGroup(f.name)}
                  isRequired={!!f.required}
                  isDisabled={!!f.disableWhenEdit && isEdit}
                  className={f.className}
                >
                  {(f.options ?? []).map((opt) => (
                    <Checkbox key={String(opt.key)} value={String(opt.key)}>
                      {opt.label}
                    </Checkbox>
                  ))}
                </CheckboxGroup>
              );
            }

            // CHECKBOX เดี่ยว
            if (f.type === "checkbox") {
              return (
                <Checkbox
                  key={f.name}
                  isSelected={!!values[f.name]}
                  onValueChange={hdlCheckbox(f.name)}
                  isDisabled={!!f.disableWhenEdit && isEdit}
                  className={f.className}
                >
                  {/* ใช้ label เป็นข้อความข้างกล่อง */}
                  {f.label ?? f.name}
                </Checkbox>
              );
            }

            // TEXT (default)
            return (
              <Input
                key={f.name}
                type={f.type === "password" ? "password" : "text"}
                radius={f.radius ?? "sm"}
                isRequired={!!f.required}
                label={f.label}
                labelPlacement="outside-top"
                placeholder={f.placeholder ?? ""}
                value={values[f.name] ?? ""}
                onValueChange={hdlChange(f.name)}
                className={f.className}
              />
            );
          })}
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-2 border-t border-zinc-200 dark:border-zinc-700 px-4 py-2">
          <motion.button
            type="button"
            whileTap={{ scale: 0.98 }}
            onClick={hdlClose}
            onMouseUp={(e) => ripple.create(e, "dark")}
            className="cursor-pointer px-6 py-1.5 rounded-xl text-sm bg-zinc-200 hover:bg-zinc-300 dark:bg-zinc-700 dark:hover:bg-zinc-600 text-zinc-800 dark:text-zinc-100"
          >
            ยกเลิก
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.98 }}
            type="submit"
            className="flex items-center gap-0.5 cursor-pointer px-8 py-1.5 rounded-xl text-sm bg-emerald-600 hover:bg-emerald-500 text-white disabled:opacity-50 disabled:cursor-not-allowed"
            onMouseUp={(e) => ripple.create(e, "dark")}
            disabled={loading}
          >
            <Save size={17} strokeWidth={1.5} />{computedSubmitText}
          </motion.button>
        </div>
      </motion.form>
    </motion.div>
  );
}

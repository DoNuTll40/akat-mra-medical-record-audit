import { Popover, PopoverContent, PopoverTrigger } from "@heroui/popover";
import { SquarePen, Trash2 } from "lucide-react";
import Ripple from "material-ripple-effects";
import { motion } from "framer-motion";

  export default function ButtonCellRenderer ({ isEdit, data, id, isOpenEdit, title, hdlDelete }) {

    const ripple = new Ripple();

    const handleClick = () => {
      isEdit(data);
      isOpenEdit(true);
    };

    return (
      <div className="w-full h-full py-1">
        <div className="h-full flex gap-1.5 justify-center items-center">
            <motion.button 
                whileTap={{ scale: 0.98 }}
                className="h-full font-semibold dark:bg-zinc-700 bg-zinc-100 rounded-xl px-2 flex gap-0.5 items-center justify-center cursor-pointer hover:shadow"
                onClick={handleClick}
                onMouseDown={(e) => ripple.create(e)}
            >
                <SquarePen size={14} />แก้ไข
            </motion.button>
            <Popover showArrow backdrop="opaque" offset={10} placement="bottom-end">
                <PopoverTrigger>
                <motion.button 
                    whileTap={{ scale: 0.98 }}
                    onMouseUp={(e) => ripple.create(e)}
                    className="h-full text-white bg-rose-700 rounded-xl px-2 font-semibold cursor-pointer flex justify-center items-center gap-0.5 hover:shadow"
                >
                    <Trash2 size={14} /> ลบ
                </motion.button>
                </PopoverTrigger>
                <PopoverContent className="flex flex-col gap-2 p-4" >
                    <p className="max-w-sm">กด "ยืนยัน" เพื่อลบหัวข้อ " <span className="bg-amber-200 dark:bg-amber-600 px-1.5 rounded animate-pulse">{title}</span> " ออกจากระบบ</p>
                    <motion.button className="w-full border border-rose-700 text-rose-700 font-semibold py-2 hover:bg-red-50 dark:hover:bg-rose-800 rounded-lg dark:bg-rose-700 dark:text-white cursor-pointer " onMouseUp={(e) => ripple.create(e)} onClick={() => hdlDelete(id)}>ยืนยัน</motion.button>
                </PopoverContent>
            </Popover>
        </div>
      </div>
    );
  };
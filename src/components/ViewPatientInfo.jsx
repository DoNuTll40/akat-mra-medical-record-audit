import { convertDate } from "@/utils/convertDate";
import { motion } from "framer-motion";

export default function ViewPatientInfo({ data, an }) {

    let finished = (data?.total_score && data?.score_obtained && data?.percentage) ? true : false;

    let percent = data?.percentage || 0;

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
            key={data.patient_id}
            className="w-full rounded-xl border border-zinc-200 dark:border-[#3a3a3a] p-3 mb-5"
        >
            <div className="flex flex-col gap-2">
                <div className="flex justify-between">
                    <div className="flex flex-col">
                        <div className="flex gap-1 items-center">
                            <p className="font-bold text-lg">{data.patients?.patient_fullname}</p>
                            <p className="text-xs line-clamp-1 w-[20%]" title={`${data?.patient_id}`} >({data.patient_id})</p>
                        </div>
                        <p className="text-sm text-zinc-500 dark:text-zinc-400">AN {an} • HN {data?.patients?.patient_hn} • {data?.patients?.patient_ward}</p>
                    </div>
                    <p className={`text-xs font-semibold flex flex-col items-end h-fit px-4 py-1 rounded-full ${finished ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-600"}`}>{finished ? "สมบูรณ์" : "ยังไม่สมบูรณ์"}</p>
                </div>

                <div className="flex justify-between">
                    <p className="text-sm text-zinc-600 dark:text-zinc-400">วันที่เข้ารับบริการ {convertDate(data?.patients?.patient_date_admitted)} • วันที่สิ้นสุด {convertDate(data?.patients?.patient_date_discharged)}</p>
                    <p className="text-sm text-zinc-600 dark:text-zinc-400">คะแนนรวม : {data?.total_score || 0} • คะแนนที่ได้ : {data?.score_obtained || 0} • ค่าร้อยละ : {data?.percentage || 0}%</p>
                </div>

                {/* progress */}
                <div className="my-1">
                    <div className="flex items-center justify-between text-xs mb-1">
                        <span className="text-zinc-500">คะแนนที่ได้คิดเป็น %</span>
                        <span className="font-medium">{percent == null ? "-" : `${percent}%`}</span>
                    </div>
                    <div className="h-2 rounded-full bg-zinc-100 dark:bg-zinc-700 overflow-hidden">
                    <div
                        className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-emerald-600"
                        style={{ width: `${percent ?? 0}%` }}
                    />
                    </div>
                </div>

                {/* create by update by */}
                <div className="flex justify-between">
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">ผู้สร้าง : {data?.created_by} | เมื่อ {new Date(data?.created_at).toLocaleDateString("th-TH", { day: "numeric", month: "short", year: "numeric", hour: "numeric", minute: "numeric" })}</p>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">ผู้แก้ไขล่าสุด : {data?.updated_by} | เมื่อ {new Date(data?.updated_at).toLocaleDateString("th-TH", { day: "numeric", month: "short", year: "numeric", hour: "numeric", minute: "numeric" })}</p>
                </div>
            </div>
        </motion.div>
    )
}

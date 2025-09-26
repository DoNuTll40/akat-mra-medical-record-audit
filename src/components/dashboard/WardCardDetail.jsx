import { motion } from "framer-motion";
import { useRouter } from "next/navigation";

export default function WardCardDetail ({ data }) {

    const router = useRouter();

    let finished = (data.form_ipd.total_score && data.form_ipd.score_obtained && data.form_ipd.percentage) ? true : false;

    let percent = data.form_ipd.percentage || 0;

    const hdlClick = (an) => {
        router.replace(`/pdf/${encodeURIComponent(an)}`);
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
            key={data.form_ipd?.form_ipd_id}
            onClick={() => finished && hdlClick(data.patient_an)}
            className={`w-full rounded-xl border border-zinc-200 dark:border-[#3a3a3a] p-3 my-2 ${finished ? `cursor-pointer` : `cursor-auto`}`}
        >
            <div className="flex flex-col gap-2">
                <div className="flex justify-between">
                    <div className="flex flex-col">
                        <div className="flex gap-1 items-center">
                            <p className="font-bold">AN {data.patient_an}</p>
                            <p className="text-xs line-clamp-1 w-[20%]" title={`${data?.patient_id}`} >({data.patient_id})</p>
                        </div>
                        <p className="text-xs text-zinc-500 dark:text-zinc-400">คะแนนรวม : {data?.form_ipd?.total_score || 0} | คะแนนที่ได้ : {data?.form_ipd?.score_obtained || 0} | ค่าร้อยละ : {data?.form_ipd?.percentage || 0}%</p>
                    </div>

                    <p className={`text-xs font-semibold flex flex-col items-end h-fit px-4 py-1 rounded-full ${finished ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-600"}`}>{finished ? "สมบูรณ์" : "ยังไม่สมบูรณ์"}</p>
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
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">ผู้สร้าง : {data?.form_ipd?.created_by} | เมื่อ {new Date(data?.form_ipd?.created_at).toLocaleDateString("th-TH", { day: "numeric", month: "short", year: "numeric", hour: "numeric", minute: "numeric" })}</p>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">ผู้แก้ไขล่าสุด : {data?.form_ipd?.updated_by} | เมื่อ {new Date(data?.form_ipd?.updated_at).toLocaleDateString("th-TH", { day: "numeric", month: "short", year: "numeric", hour: "numeric", minute: "numeric" })}</p>
                </div>
            </div>
        </motion.div>
    )
}
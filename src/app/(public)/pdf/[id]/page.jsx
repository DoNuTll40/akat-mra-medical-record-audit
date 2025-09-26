"use client";

import ViewPatientInfo from "@/components/ViewPatientInfo";
import axiosApi from "@/config/axios-api";
import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Ripple from "material-ripple-effects";
import Link from "next/link";

export default function page({params}) {
    const { id } = React.use(params);
    const an = decodeURIComponent(id);
    const [data, setData] = useState({});
    const [ base64, setBase64 ] = useState("");

    let token = localStorage.getItem("token");
    const ripple = new Ripple();

    useEffect(() => {
        fetchPdfByAn();
    }, [])

    const fetchPdfByAn = async () => {
        try {
            const res = await axiosApi.get(`/mraIpd/fetchPdf/${an}`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            setData(res?.data?.data?.form_ipds ?? {});
            setBase64(res?.data?.data?.pdf_file ?? "");
        } catch (error) {
            console.log(error);
        }
    }

    return (
        <>
            <Link
                href="/"
                className="text-white w-fit bg-cyan-500 rounded-xl px-4 py-1.5 font-semibold cursor-pointer flex justify-center items-center gap-0.5 hover:shadow mb-4"
                onMouseDown={(e) => ripple.create(e)}
            >
                ย้อนกลับ
            </Link>
            {/* infomation patient */}
            <ViewPatientInfo data={data} an={an} />
            {/* PDF */}
            <div className="w-full h-[calc(100vh-25vh)]">
                <iframe className="rounded-xl" src={`data:application/pdf;base64,${base64}`} width="100%" height="100%" />
            </div>
        </>
    )
}

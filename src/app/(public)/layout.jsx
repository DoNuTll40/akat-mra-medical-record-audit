"use client";

import "../globals.css";
import { useState } from "react";
import { PanelLeft, X } from "lucide-react";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import useLockBody from "@/hooks/useLockBody.mjs";
import AuthenHook from "@/hooks/AuthenHook.mjs";
import LoadingCenter from "@/components/loading";

export default function PublicLayout({ children }) {
  const { authLoading } = AuthenHook();
  const [open, setOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  useLockBody(open);

  if(authLoading){
    return (
      <div className="w-full h-dvh flex items-center justify-center"><LoadingCenter /></div>
    )
  }

  return (
    <div className="h-dvh flex flex-col font-sans">
      <div className="flex flex-1 min-h-0">

        {/* Sidebar Desktop */}
        <aside className={`hidden lg:flex rounded-r-xl flex-col transition-all ease-in-out duration-300 bg-[#F9F9F9] dark:bg-[#181818] border-r-[0.2] border-black/10 dark:border-[#2C2C2C] ${ collapsed ? "w-14" : "w-64" }`}>
            <div className="h-12 my-0.5 flex items-center justify-between px-2">
                <p className={`whitespace-nowrap overflow-hidden transition-all ease-in-out duration-500 ${collapsed ? "w-0 opacity-0" : "w-full opacity-100"} `}>Medical Record Audit</p>
                <button className={` ${collapsed ? 'w-full flex justify-center' : ''} cursor-w-resize opacity-80 p-2 rounded-md hover:bg-[#EFEFEF] hover:dark:bg-[#303030]`} onClick={() => setCollapsed(!collapsed)} aria-label="Toggle sidebar"><PanelLeft size={20} /></button>
            </div>
            <div className="h-[calc(100dvh)] overflow-y-auto p-2">
                <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />
            </div>
        </aside>

        {/* Sidebar Mobile */}
        <div className={`lg:hidden fixed inset-0 z-50 ${ open ? "" : "pointer-events-none" }`} >
          <div className={`absolute bg-black/20 dark:bg-white/5 backdrop-blur-xs inset-0 transition-opacity duration-400 ${ open ? "opacity-100" : "opacity-0" }`} onClick={() => setOpen(false)} aria-hidden="true" />
          <aside className={`absolute bg-[#F9F9F9] dark:bg-[#181818] top-0 left-0 h-full w-80 max-w-[85%] shadow-xl transition-transform duration-400 ${ open ? "translate-x-0" : "-translate-x-full" }`} role="dialog" aria-label="Mobile menu" >
            <div className="h-12 border-b-[0.2] border-black/10 dark:border-[#2C2C2C] px-4 my-0.25 flex items-center justify-between">
              <span className="font-semibold">Medical Record Audit</span>
              <button className="inline-flex cursor-pointer rounded-full py-2 px-2 text-sm hover:bg-[#e6e6e6] hover:dark:bg-[#303030]" onClick={() => setOpen(false)} aria-label="Close menu" >
                <X size={16} />
              </button>
            </div>
            <div className="h-[calc(100dvh-4rem)] overflow-y-auto p-4 pb-24">
              <Sidebar collapsed={false} setCollapsed={setCollapsed} />
            </div>
          </aside>
        </div>

        {/* Main + Footer wrapper */}
        <div className="flex-1 flex flex-col min-w-0">
            <Header onOpenMenu={() => setOpen(true)} />
            {/* Main content scrollable */}
            <main className="flex-1 overflow-y-auto">
                <div className="max-w-[95rem] mx-auto w-full px-4 sm:px-6 py-5">
                  {children}
                </div>
            </main>
            <Footer />
        </div>
      </div>
    </div>
  );
}

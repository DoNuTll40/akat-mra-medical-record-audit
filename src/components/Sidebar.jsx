"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { LayoutDashboard, FileText, ListChecks, SearchCheck, FileCheck2, Building2 } from "lucide-react";
import NavGroup from "./NavGroup";
import NavLeaf from "./NavLeaf";

const NAV = [
  {
    title: "Overview",
    items: [
      { label: "Dashboard", href: "/", icon: LayoutDashboard },
      {
        label: "Forms",
        href: "/forms",
        icon: FileText,
        children: [
          { label: "IPD", href: "/forms/ipd", badge: "เปิดทดสอบ", color: "emerald" },
          { label: "OPD", href: "/forms/opd", badge: "กำลังพัฒนา", color: "rose" },
          { label: "ER",  href: "/forms/er", badge: "กำลังพัฒนา", color: "rose" },
        ],
      },
    ],
  },
  {
    title: "การตั้งค่า",
    items: [
      { label: "หน่วยบริการ", href: "/settings/service-units", icon: Building2 },
      { label: "หัวข้อฟอร์ม", href: "/settings/form-items", icon: ListChecks },
      { label: "ข้อค้นพบโดยรวม", href: "/settings/overall-findings", icon: SearchCheck },
      { label: "สถานะการทบทวน", href: "/settings/review-status", icon: FileCheck2 },
    ],
  },
];

export default function Sidebar({ collapsed }) {
  const pathname = usePathname();

  return (
      <div className="overflow-y-auto select-none">
        {NAV.map((sec) => (
          <section key={sec.title} className="mb-3">
            {!collapsed && (
              <div className="px-2 pb-1 text-[12px] uppercase tracking-wider text-black/80 dark:text-white/50 line-clamp-1">
                {sec.title}
              </div>
            )}
            <ul className="space-y-1 line-clamp-1">
              {sec.items.map((item) => 
                item.children ? (
                  <NavGroup
                    key={item.href}
                    item={item}
                    pathname={pathname}
                    collapsed={collapsed}
                  />
                ) : (
                  <NavLeaf
                    key={item.href}
                    item={item}
                    active={pathname === item.href}
                    collapsed={collapsed}
                  />
                )
              )}
            </ul>
          </section>
        ))}
      </div>
  );
}

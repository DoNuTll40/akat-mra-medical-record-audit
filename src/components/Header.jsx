"use client";

import { useEffect, useMemo, useState, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import axiosSystem from "@/config/axios-system";
import { getGravatar } from "@/config/crypto.mjs";
import AuthenHook from "@/hooks/AuthenHook.mjs";
import { useTheme } from "next-themes";

import { Avatar, Dropdown, DropdownItem, DropdownMenu, DropdownTrigger } from "@heroui/react";
import { Menu, UserRound, Camera, BookOpenText, LogOut, Palette, Sun, Moon, MonitorCog, ExternalLink } from "lucide-react";

export default function Header({ onOpenMenu }) {
  const [hname, setHname] = useState("ชื่อโรงพยาบาล");
  const [hsname, setHsname] = useState("ชื่อโรงพยาบาล");
  const [hcode, setHcode] = useState("รหัสโรงพยาบาล");
  const [profileUrl, setProfileUrl] = useState(null);

  const { logout, profile } = AuthenHook();
  const router = useRouter();
  const { resolvedTheme, setTheme } = useTheme();
  const abortRef = useRef(null);

  useEffect(() => {
    abortRef.current = new AbortController();
    (async () => {
      try {
        const res = await axiosSystem.get("/api/config", {
          signal: abortRef.current.signal,
        });
        if (res.status === 200) {
          setHname(res.data.hospital.name);
          setHsname(res.data.hospital.shortName);
          setHcode(res.data.hospital.code);
        }
      } catch (err) {
        // ไม่ร้องก็ได้ แค่เผื่อไม่ให้หน้าพังถ้าเน็ตหาย
        console.log("fetchHospitalInfo:", err?.name || err);
      }
    })();
    return () => abortRef.current?.abort();
  }, []);

  useEffect(() => {
    if (profile?.email) setProfileUrl(getGravatar(profile.email));
    else setProfileUrl(null);
  }, [profile?.email]);

  const statusDotClass = useMemo(() => {
    const s = (profile?.status || "").toLowerCase();
    if (s === "admin") return "bg-rose-500";
    if (s === "user") return "bg-amber-500";
    return "bg-zinc-400";
  }, [profile?.status]);

  const hospitalTitleDesktop = useMemo(
    () => `${hname} (${hcode})`,
    [hname, hcode]
  );

  const hospitalTitleMobile = useMemo(
    () => `${hsname} (${hcode})`,
    [hsname, hcode]
  );

  return (
    <header className="select-none z-40 backdrop-blur border-b-[0.2] border-black/10 dark:border-[#2C2C2C]">
      <div className="px-4 sm:px-6 lg:px-8 h-12 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button className="lg:hidden inline-flex cursor-pointer rounded-full py-2 px-2 text-sm hover:bg-[#e6e6e6] hover:dark:bg-[#303030]" aria-label="Open menu" onClick={onOpenMenu} >
              <Menu size={20} />
          </button>

          <Link
            href="/"
            className="hidden sm:block font-bold text-lg sm:text-base tracking-tight line-clamp-1 pl-0.25"
            title={hospitalTitleDesktop}
          >
            {hospitalTitleDesktop}
          </Link>
          <Link
            href="/"
            className="block sm:hidden font-bold text-lg sm:text-base tracking-tight line-clamp-1 pl-0.25"
            title={hospitalTitleMobile}
          >
            {hospitalTitleMobile}
          </Link>

        </div>

        <div className="flex items-center gap-2 w-fit">
          {!profile ? (
            <Link
              className="cursor-pointer line-clamp-1 rounded-lg py-1.5 px-4 text-sm bg-[#f2f2f2] dark:bg-[#242424] hover:bg-[#e6e6e6] hover:dark:bg-[#303030]"
              href="/auth/login"
            >
              เข้าสู่ระบบ
            </Link>
          ) : (
            <Dropdown>
              <DropdownTrigger>
                <div className="flex items-center gap-2 cursor-pointer rounded-full py-1.5 pl-1.5 pr-4 text-sm dark:bg-[#242424] hover:bg-[#e6e6e6] hover:dark:bg-[#303030]">
                  <div className="relative">
                    <Avatar size="sm" src={profileUrl ?? undefined} />
                    <span
                      className={`absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full ring-2 ring-white dark:ring-black ${statusDotClass}`}
                    />
                  </div>
                  <div className="sm:block hidden">
                    <p className="text-xs font-medium">
                      {profile?.fullname ?? "ผู้ใช้ไร้ชื่อ"}
                    </p>
                    <p className="text-[10px] opacity-70 capitalize">
                      {(profile?.status ?? "offline").toLowerCase()}
                    </p>
                  </div>
                </div>
              </DropdownTrigger>

              <DropdownMenu className="p-2" aria-label="profile menu" variant="solid">
                <DropdownItem
                  key="profile"
                  startContent={<UserRound className="size-4" />}
                  description={ <p className="max-w-[260px]">ระบบจะเปิดระบบ BackOffice เพื่อดูโปรไฟล์</p> }
                  onPress={() => window.open(
                    "https://akathos.moph.go.th/backoffice/person/user/personinfouser",
                    "_blank",
                    "noopener,noreferrer"
                  )}
                  endContent={ <ExternalLink className="size-4" /> }
                >
                  <a target="_blank" rel="noopener noreferrer">
                  โปรไฟล์ของฉัน
                  </a>
                </DropdownItem>

                <DropdownItem
                  key="avatar"
                  target="_blank"
                  startContent={ <Camera className="size-5" /> }
                  description={ <p className="max-w-[260px]">รูปภาพจาก Gravatar โดยเข้าสู่ระบบด้วยบัญชีเมลของ BackOffice</p> }
                  onPress={() =>
                    window.open(
                      "https://wordpress.com/log-in/link?client_id=1854&redirect_to=https%3A%2F%2Fpublic-api.wordpress.com%2Foauth2%2Fauthorize%3Fclient_id%3D1854%26response_type%3Dcode%26blog_id%3D0%26state%3D2aad56dbbdbb3d152f0d9d56388391894abcc2d13be7a455933828035782b571%26redirect_uri%3Dhttps%253A%252F%252Fgravatar.com%252Fconnect%252F%253Faction%253Drequest_access_token%26from-calypso%3D1",
                      "_blank",
                      "noopener,noreferrer"
                    )
                  }
                  endContent={ <ExternalLink className="size-4" /> }
                >
                  แก้ไขรูปภาพ
                </DropdownItem>

                <DropdownItem
                  key="docs"
                  startContent={<BookOpenText className="size-4" />}
                  onClick={() => router.push("/docs")}
                  isDisabled
                >
                  คู่มือการใช้งาน
                </DropdownItem>

                <DropdownItem
                  key="logout"
                  className="text-danger"
                  color="danger"
                  startContent={<LogOut className="size-4" />}
                  onClick={logout}
                >
                  ออกจากระบบ
                </DropdownItem>
              </DropdownMenu>
            </Dropdown>
          )}
        </div>
      </div>
    </header>
  );
}

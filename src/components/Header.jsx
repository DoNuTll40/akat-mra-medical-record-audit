"use client";

import { useEffect, useState } from "react";
import { Menu } from "lucide-react";
import { useRouter } from "next/navigation";
import axiosSystem from "@/config/axios-system";
import { env } from "next-runtime-env";
import Link from "next/link";
import { getGravatar } from "@/config/crypto.mjs";
import Image from "next/image";
import { Avatar, Dropdown, DropdownItem, DropdownMenu, DropdownTrigger } from "@heroui/react";
import AuthenHook from "@/hooks/AuthenHook.mjs";

export default function Header({ onOpenMenu }) {
  const [hname, setHname] = useState("ชื่อโรงพยาบาล");
  const [hsname, setHsname] = useState("ชื่อโรงพยาบาล");
  const [hcode, setHcode] = useState("รหัสโรงพยาบาล");
  const [profile, setProfile] = useState(null);
  const [profileUrl, setProfileUrl] = useState(null);

  const { logout } = AuthenHook();

  const router = useRouter();

  useEffect(() => {
    fetchHospitalInfo();
    const stored = localStorage.getItem("profile");
    if (stored) {
      setProfile(JSON.parse(stored));
    }
  }, []);

  useEffect(() => {
    if (profile?.email) {
      const url = getGravatar(profile.email);
      setProfileUrl(url);
    }
  }, [profile]);

  const fetchHospitalInfo = async () => {
    try {
      const res = await axiosSystem.get('/api/config');
      if(res.status === 200){
        setHname(res.data.hospital.name);
        setHsname(res.data.hospital.shortName);
        setHcode(res.data.hospital.code);
      }
      console.log(res)

    } catch (err) {
      console.log(err)
    }
  }

  return (
    <header className="select-none z-40 backdrop-blur border-b-[0.2] border-black/10 dark:border-[#2C2C2C]">
      <div className="px-4 sm:px-6 lg:px-8 h-12 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            className="lg:hidden inline-flex cursor-pointer rounded-full py-2 px-2 text-sm hover:bg-[#e6e6e6] hover:dark:bg-[#303030]"
            aria-label="Open menu"
            onClick={onOpenMenu}
          >
            <Menu size={20} />
          </button>
          <Link
            href={"/"}
            className="hidden sm:block font-bold text-lg sm:text-base tracking-tight line-clamp-1 pl-0.25"
          >
            {`${hname} (${hcode})`}
          </Link>
          <Link
            href={"/"}
            className="block sm:hidden font-bold text-lg sm:text-base tracking-tight line-clamp-1 pl-0.25"
          >
            {`${hsname} (${hcode})`}
          </Link>
        </div>
        <div className="flex items-center gap-2 w-fit">
          { !profile ? 
          <Link
            className="cursor-pointer line-clamp-1 rounded-lg py-1.5 px-4 text-sm bg-[#f2f2f2] dark:bg-[#242424] hover:bg-[#e6e6e6] hover:dark:bg-[#303030]"
            href={'/auth/login'}>
            เข้าสู่ระบบ
          </Link> : 
          <Dropdown>
            <DropdownTrigger>
            <div className="flex items-center gap-2 cursor-pointer rounded-lg py-1.5 px-4 text-sm bg-[#f2f2f2] dark:bg-[#242424] hover:bg-[#e6e6e6] hover:dark:bg-[#303030]">
            <Avatar size="sm" src={profileUrl} />
            <div>
              <p className="text-xs">{profile?.fullname}</p>
              <p className="text-xs">{profile?.status.toLowerCase()}</p>
            </div>
          </div>
            </DropdownTrigger>
            <DropdownMenu  variant="solid">
              <DropdownItem description="แก้ไขรูปภาพ Gravatar" onClick={() => router.push("https://wordpress.com/log-in/link?client_id=1854&redirect_to=https%3A%2F%2Fpublic-api.wordpress.com%2Foauth2%2Fauthorize%3Fclient_id%3D1854%26response_type%3Dcode%26blog_id%3D0%26state%3D2aad56dbbdbb3d152f0d9d56388391894abcc2d13be7a455933828035782b571%26redirect_uri%3Dhttps%253A%252F%252Fgravatar.com%252Fconnect%252F%253Faction%253Drequest_access_token%26from-calypso%3D1")} >แก้ไขโปรไฟล์</DropdownItem>
              <DropdownItem key="logout" className="text-danger" color="danger" onClick={ () => logout() }>ออกจากระบบ</DropdownItem>
            </DropdownMenu>
          </Dropdown>
          }
        </div>
      </div>
    </header>
  );
}

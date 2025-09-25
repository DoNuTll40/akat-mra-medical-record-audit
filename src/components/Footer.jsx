"use client";

export default function Footer() {
    return (
        <footer className="select-none border-t-[0.2] border-black/10 dark:border-[#2C2C2C]">
            <div className="px-4 sm:px-6 lg:px-8 h-6 flex items-center justify-center text-xs text-[#505661]">
                <span className="line-clamp-1">Copyright &copy; {new Date().getFullYear()} โรงพยาบาลอากาศอำนวย – กลุ่มงานสุขภาพดิจิทัล. All rights reserved.</span>
            </div>
        </footer>
    );
}
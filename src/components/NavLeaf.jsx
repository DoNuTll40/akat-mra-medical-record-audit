import cx from "@/utils/cx";
import Link from "next/link";

export default function NavLeaf({ item, active, collapsed }) {
  const Icon = item.icon;
  return (
    <li>
      <Link
        href={item.href}
        aria-current={active ? "page" : undefined}
        className={cx(
          "group flex w-full items-center rounded-xl px-2.5 py-2 text-sm transition cursor-pointer",
          "hover:bg-black/5 dark:hover:bg-white/5",
          active && "bg-black/10 dark:bg-white/10 ring-1 ring-black/10 dark:ring-white/10"
        )}
        title={collapsed ? item.label : undefined}
      >
        <Icon className="h-5 w-5 shrink-0 opacity-90" />
        <span
          className={cx(
            "ml-2 truncate",
            collapsed && "hidden"
          )}
        >
          {item.label}
        </span>
      </Link>
    </li>
  );
}

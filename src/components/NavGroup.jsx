import { ChevronDown } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import cx from "@/utils/cx";
import Link from "next/link";

export default function NavGroup({ item, pathname, collapsed }) {

  const isParentActive =
    pathname === item.href || pathname.startsWith(item.href + "/");

  const initiallyOpen = useMemo(
    () => isParentActive || item.children?.some((c) => pathname === c.href),
    [pathname]
  );

  const [open, setOpen] = useState(initiallyOpen);

  useEffect(() => setOpen(initiallyOpen), [initiallyOpen]);

  const Icon = item.icon;

  return (
    <li>
      <button
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className={cx(
          "flex w-full items-center justify-between rounded-lg px-2.5 py-2 text-sm transition cursor-pointer",
          "hover:bg-black/5 dark:hover:bg-white/5",
          (open || isParentActive) &&
            "bg-black/10 dark:bg-white/10 ring-1 ring-black/10 dark:ring-white/10"
        )}
        title={collapsed ? item.label : undefined}
      >
        <span className="flex items-center">
          <Icon className="h-5 w-5 shrink-0 opacity-90" />
          <span className={cx("ml-2 truncate", collapsed && "hidden")}>
            {item.label}
          </span>
        </span>
        <ChevronDown
          className={cx(
            "h-4 w-4 shrink-0 transition-transform",
            collapsed && "hidden",
            open && "rotate-180"
          )}
        />
      </button>

      {/* children */}
      <div
        className={cx(
          "overflow-hidden pl-5",
          "transition-[max-height,opacity] duration-200 ease-out",
          open ? "max-h-64 opacity-100" : "max-h-0 opacity-0",
          collapsed && "hidden"
        )}
      >
        <ul className="my-1 space-y-1">
          {item.children?.map((c) => {
            const active = pathname === c.href;
            return (
              <li key={c.href}>
                <Link
                  href={c.href}
                  className={cx(
                    "flex w-full items-center rounded-md pl-5 px-2 py-1.5 text-sm relative cursor-pointer",
                    "hover:bg-black/5 dark:hover:bg-white/5",
                    active &&
                      "bg-black/10 dark:bg-white/10 ring-1 ring-black/10 dark:ring-white/10"
                  )}
                >
                  {/* <span className="mr-2 inline-block h-[6px] w-[6px] rounded-full bg-white/70" /> */}
                  <span className="truncate">{c.label}</span>
                  {c.badge && (
                    <span
                      className={`line-clamp-1 mr-4 absolute transition-all ease-out duration-200 right-0 rounded-full border border-${c.color}-700/50
                        dark:border-${c.color}-500/30 bg-${c.color}-500/20 dark:bg-${c.color}-500/10 px-2 text-[9px] text-${c.color}-700 
                        dark:text-${c.color}-400 ${collapsed ? "opacity-0" : "opacity-100"} `}
                    >
                      {c.badge}
                    </span>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </li>
  );
}

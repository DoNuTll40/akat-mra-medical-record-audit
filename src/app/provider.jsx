"use client";

import { AuthenContextProvider } from "@/contexts/AuthenContext";
import { ToastProvider } from "@heroui/react";
import { ThemeProvider } from "next-themes";
import NextTopLoader from "nextjs-toploader";

export function Providers({ children }) {
  return (
    <AuthenContextProvider>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        <NextTopLoader color={"var(--toploader)"} showSpinner={false} crawl crawlSpeed={1000} height={3} />
        <ToastProvider placement="top-right" toastOffset={16} toastProps={{ variant: "solid", radius: "lg", classNames: {
          icon: "size-6 text-white",
          title: "text-white text-base font-semibold",
          description: "text-white",
        }, }} />
        {children}
      </ThemeProvider>
    </AuthenContextProvider>
  );
}

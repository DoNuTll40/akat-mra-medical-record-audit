import { Sarabun } from "next/font/google";
import "./globals.css";
import { PublicEnvScript } from "next-runtime-env";
import { Providers } from "./provider";

const sarabun = Sarabun({
  subsets: ["thai"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800"],
  display: "swap",
});

export const metadata = {
  title: "Medical Record Audit",
  description: process.env.NEXT_PUBLIC_APP_DESCRIPTION,
  manifest: process.env.NEXT_PUBLIC_BASE_PATH + '/manifest.json',
  icons: {
    icon: [
      {
        url: process.env.NEXT_PUBLIC_BASE_PATH
        ? process.env.NEXT_PUBLIC_BASE_PATH + '/' + process.env.NEXT_PUBLIC_URL_APP_ICON_192
        : process.env.NEXT_PUBLIC_URL_APP_ICON_192,
        href: process.env.NEXT_PUBLIC_BASE_PATH
        ? process.env.NEXT_PUBLIC_BASE_PATH + '/' + process.env.NEXT_PUBLIC_URL_APP_ICON_192
        : process.env.NEXT_PUBLIC_URL_APP_ICON_192,
      }
    ]
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="th">
      <head>
        <PublicEnvScript />
      </head>
      <body className={sarabun.className}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}

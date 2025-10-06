import { ScreenSize } from "@/components/ui/screen-size";
import { Providers } from "@/lib/providers";
import "@/styles/globals.css";

import { type Metadata } from "next";
import { Inter } from "next/font/google";
import localFont from "next/font/local";

export const metadata: Metadata = {
  title: {
    template: "%s • Fair Share",
    default: "Fair Share",
  },
  description: "fairshare",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const satoshi = localFont({
  src: [
    {
      path: "../../public/fonts/Satoshi-Regular.ttf",
      weight: "400",
      style: "normal",
    },
    {
      path: "../../public/fonts/Satoshi-Medium.ttf",
      weight: "500",
      style: "normal",
    },
    {
      path: "../../public/fonts/Satoshi-Bold.ttf",
      weight: "700",
      style: "normal",
    },
  ],
  variable: "--font-satoshi",
  display: "swap",
});

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${inter.variable} ${satoshi.variable}`} data-scroll-behavior="smooth">
      <body className="font-inter antialiased">
        <Providers>{children}</Providers>
        <ScreenSize />
      </body>
    </html>
  );
}

import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { COLLEGE_CONFIG } from "@/config/college";

const inter = Inter({ 
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: `${COLLEGE_CONFIG.name} - Digital Token System`,
  description: `${COLLEGE_CONFIG.name} administrative queue and student services token platform.`,
  icons: {
    icon: "/logo.png",
    shortcut: "/logo.png",
    apple: "/logo.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/logo.png" type="image/png" />
      </head>
      <body className={`${inter.className} bg-[#f8fafc] text-[#0f172a] antialiased`}>
        {children}
      </body>
    </html>
  );
}

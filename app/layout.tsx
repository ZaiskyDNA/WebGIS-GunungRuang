import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import YotaChat from "@/components/YotaChat";
import PushNotification from "@/components/PushNotification";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: {
    default: "YOTA | Informasi Bencana Gunung Ruang",
    template: "%s | YOTA",
  },
  description:
    "Portal WebGIS untuk mitigasi, pemantauan, dan tanggap darurat Gunung Ruang di Sulawesi Utara.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className="scroll-smooth">
      <body className={`${inter.className} min-h-screen antialiased`}>
        <PushNotification />
        <Navbar />
        {children}
        <YotaChat />
      </body>
    </html>
  );
}

import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

// --- KOMPONEN GLOBAL ---
import Navbar from "../components/Navbar";
import VoiceflowAI from "../components/VoicefLow"; 
import PushNotification from "../components/PushNotification";

// --- KONFIGURASI FONT ---
const inter = Inter({ subsets: ["latin"] });

// --- METADATA SEO & TAB BROWSER ---
export const metadata: Metadata = {
  title: "RuangTangguh | Sistem Informasi Bencana",
  description: "Portal WebGIS terintegrasi untuk mitigasi, pemantauan, dan tanggap darurat bencana Gunung Ruang di Sulawesi Utara.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // Menambahkan scroll-smooth agar navigasi halaman terasa lebih lembut
    <html lang="id" className="scroll-smooth">
      <body 
        className={`${inter.className} antialiased bg-[#faf8f5] text-gray-800 flex flex-col min-h-screen`}
      >
        {/* 1. Listener Notifikasi Real-time (Bekerja di latar belakang) */}
        <PushNotification />

        {/* 2. Navigasi Utama */}
        <Navbar />
        
        {/* 3. Konten Halaman Dinamis */}
        <main className="flex-grow">
          {children}
        </main>
        
        {/* 4. Widget Asisten Virtual AI */}
        <VoiceflowAI /> 
      </body>
    </html>
  );
}
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "../components/Navbar"; // Impor Navbar yang baru dibuat

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Sistem Informasi Bencana Gunung Ruang",
  description: "WebGIS Prototipe Pemantauan Bencana Gunung Ruang",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body className={inter.className}>
        {/* Navbar akan selalu muncul di atas */}
        <Navbar />
        
        {/* Konten halaman akan berubah-ubah di bawah sini */}
        {children}
      </body>
    </html>
  );
}
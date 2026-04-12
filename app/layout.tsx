import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "../components/Navbar";
import Script from "next/script";

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
        <Navbar />
        {children}

        {/* --- KONFIGURASI CHATBASE AI --- */}
        <Script id="chatbase-config" strategy="lazyOnload">
          {`
            window.chatbaseConfig = {
              chatbotId: "GANTI_DENGAN_ID_CHATBOT_ANDA_DI_SINI",
            }
          `}
        </Script>

        <script
          src="https://www.chatbase.co/embed.min.js"
          data-chatbot-id="0T8bLsCVsASnwDQK_aggH"
          data-domain="www.chatbase.co"
          defer
        ></script>
      </body>
    </html>
  );
}
"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

export default function Navbar() {
  const pathname = usePathname();
  // State untuk mendeteksi apakah menu HP sedang dibuka atau ditutup
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <nav className="bg-volcano-dark text-volcano-sand shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          
          {/* Logo & Judul */}
          <div className="flex-shrink-0 flex items-center">
            <Link href="/" className="font-bold text-lg md:text-xl tracking-wider flex items-center gap-2">
              <span className="text-2xl">🌋</span> SIB G.RUANG
            </Link>
          </div>

          {/* Menu Desktop (Sembunyi di layar HP) */}
          <div className="hidden md:flex space-x-1 items-center">
            <Link 
              href="/" 
              className={`px-3 py-2 rounded-md text-sm transition ${pathname === '/' ? 'bg-volcano-main font-bold shadow-inner' : 'font-medium hover:bg-volcano-main/50'}`}
            >
              Pra-Bencana (Mitigasi)
            </Link>
            <Link 
              href="/tanggap-darurat" 
              className={`px-3 py-2 rounded-md text-sm transition ${pathname === '/tanggap-darurat' ? 'bg-volcano-main font-bold shadow-inner' : 'font-medium hover:bg-volcano-main/50'}`}
            >
              Tanggap Darurat
            </Link>
            <Link 
              href="/pasca-bencana" 
              className={`px-3 py-2 rounded-md text-sm transition ${pathname === '/pasca-bencana' ? 'bg-volcano-main font-bold shadow-inner' : 'font-medium hover:bg-volcano-main/50'}`}
            >
              Pasca-Bencana (Historis)
            </Link>
            <Link 
              href="/login" 
              className="ml-4 bg-volcano-sand text-volcano-dark hover:bg-white px-4 py-2 rounded-md text-sm font-bold transition shadow-sm"
            >
              Login Petugas
            </Link>
          </div>

          {/* Tombol Hamburger untuk Mobile (Muncul hanya di layar HP) */}
          <div className="md:hidden flex items-center">
            <button 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-volcano-sand hover:text-white focus:outline-none p-2"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {isMobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Menu Dropdown Mobile */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-volcano-main shadow-inner">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 flex flex-col">
            <Link 
              href="/" 
              onClick={() => setIsMobileMenuOpen(false)}
              className={`block px-3 py-2 rounded-md text-base ${pathname === '/' ? 'bg-volcano-dark font-bold' : 'font-medium hover:bg-volcano-dark/50'}`}
            >
              Pra-Bencana (Mitigasi)
            </Link>
            <Link 
              href="/tanggap-darurat" 
              onClick={() => setIsMobileMenuOpen(false)}
              className={`block px-3 py-2 rounded-md text-base ${pathname === '/tanggap-darurat' ? 'bg-volcano-dark font-bold' : 'font-medium hover:bg-volcano-dark/50'}`}
            >
              Tanggap Darurat (Saat Ini)
            </Link>
            <Link 
              href="/pasca-bencana" 
              onClick={() => setIsMobileMenuOpen(false)}
              className={`block px-3 py-2 rounded-md text-base ${pathname === '/pasca-bencana' ? 'bg-volcano-dark font-bold' : 'font-medium hover:bg-volcano-dark/50'}`}
            >
              Pasca-Bencana (Historis)
            </Link>
            <Link 
              href="/login" 
              onClick={() => setIsMobileMenuOpen(false)}
              className="block mt-4 text-center bg-volcano-sand text-volcano-dark px-3 py-2 rounded-md text-base font-bold shadow-md"
            >
              Login Petugas
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
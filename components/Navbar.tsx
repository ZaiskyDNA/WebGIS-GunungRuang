"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import Image from "next/image";

const navigation = [
  { href: "/", label: "Mitigasi" },
  { href: "/tanggap-darurat", label: "Tanggap darurat" },
  { href: "/pasca-bencana", label: "Pasca-bencana" },
  { href: "/game", label: "Game" },
];

function BrandMark() {
  return (
    <div className="relative size-10 overflow-hidden rounded-2xl border border-volcano-sand/40 bg-volcano-sand/20 shadow-sm shrink-0 flex items-center justify-center">
      <Image
        src="/maskot.webp"
        alt="Maskot YOTA"
        width={40}
        height={40}
        className="object-cover object-center size-full"
        priority
      />
    </div>
  );
}

export default function Navbar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const isActive = (href: string) => href === "/" ? pathname === href : pathname.startsWith(href);

  return (
    <header className="sticky top-0 z-[1000] border-b border-white/10 bg-volcano-dark/95 text-white shadow-[0_8px_30px_rgba(94,0,6,.16)] backdrop-blur-xl">
      <nav className="yota-shell flex min-h-18 items-center justify-between gap-4" aria-label="Navigasi utama">
        <Link href="/" className="flex items-center gap-3 rounded-xl" onClick={() => setIsOpen(false)}>
          <BrandMark />
          <span>
            <span className="block text-xl font-black leading-none tracking-[0.18em]">YOTA</span>
            <span className="mt-1 hidden text-[9px] font-semibold uppercase tracking-[0.16em] text-volcano-sand/80 sm:block">
              Siaga Gunung Ruang
            </span>
          </span>
        </Link>

        <div className="hidden items-center gap-1 md:flex">
          {navigation.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`rounded-xl px-4 py-2.5 text-sm font-semibold transition-colors ${
                isActive(item.href)
                  ? "bg-white text-volcano-dark shadow-sm"
                  : "text-white/75 hover:bg-white/10 hover:text-white"
              }`}
            >
              {item.label}
            </Link>
          ))}
          <Link
            href="/login"
            className="ml-2 rounded-xl bg-volcano-sand px-4 py-2.5 text-sm font-bold text-volcano-dark transition hover:bg-white"
          >
            Portal petugas
          </Link>
        </div>

        <button
          type="button"
          className="grid size-11 place-items-center rounded-xl border border-white/15 bg-white/5 md:hidden"
          aria-label={isOpen ? "Tutup menu" : "Buka menu"}
          aria-expanded={isOpen}
          aria-controls="mobile-navigation"
          onClick={() => setIsOpen((value) => !value)}
        >
          <svg viewBox="0 0 24 24" className="size-6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            {isOpen ? <path d="m6 6 12 12M18 6 6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
          </svg>
        </button>
      </nav>

      {isOpen && (
        <div id="mobile-navigation" className="border-t border-white/10 bg-volcano-dark px-4 py-4 md:hidden">
          <div className="mx-auto flex max-w-7xl flex-col gap-1">
            {navigation.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className={`rounded-xl px-4 py-3 text-sm font-semibold ${isActive(item.href) ? "bg-white text-volcano-dark" : "text-white/80"}`}
              >
                {item.label}
              </Link>
            ))}
            <Link href="/login" onClick={() => setIsOpen(false)} className="mt-2 rounded-xl bg-volcano-sand px-4 py-3 text-center text-sm font-bold text-volcano-dark">
              Portal petugas
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}

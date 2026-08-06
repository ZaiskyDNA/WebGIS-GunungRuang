"use client";

import { FormEvent, KeyboardEvent, useEffect, useRef, useState } from "react";
import Image from "next/image";

type ChatRole = "user" | "assistant";

interface ChatMessage {
  id: string;
  role: ChatRole;
  content: string;
}

const WELCOME_MESSAGE: ChatMessage = {
  id: "welcome",
  role: "assistant",
  content: "Halo, saya YOTA AI! 🌋\nSaya siap membantu memberikan informasi kesiapsiagaan, evakuasi, dan pemantauan Gunung Ruang. Apa yang ingin Anda ketahui?",
};

const SUGGESTIONS = [
  " Apa potensi bahaya Gunung Ruang?",
  " Apa saja isi tas siaga bencana?",
  " Bagaimana protokol saat status AWAS?",
  " Dimana lokasi posko evakuasi?",
];

function FormattedMessage({ content, isUser }: { content: string; isUser: boolean }) {
  if (isUser) {
    return <span className="whitespace-pre-wrap font-medium">{content}</span>;
  }

  const renderBold = (text: string) => {
    const boldParts = text.split(/(\*\*[^*]+\*\*)/g);
    return boldParts.map((part, i) => {
      if (part.startsWith("**") && part.endsWith("**")) {
        return <strong key={i} className="font-extrabold text-volcano-dark">{part.slice(2, -2)}</strong>;
      }
      const italicParts = part.split(/(\*[^*]+\*)/g);
      if (italicParts.length > 1) {
        return italicParts.map((sub, j) => {
          if (sub.startsWith("*") && sub.endsWith("*")) {
            return <em key={j} className="italic text-gray-700">{sub.slice(1, -1)}</em>;
          }
          return sub;
        });
      }
      return part;
    });
  };

  const renderInline = (text: string) => {
    const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
    const parts: React.ReactNode[] = [];
    let lastIdx = 0;
    let match;

    while ((match = linkRegex.exec(text)) !== null) {
      if (match.index > lastIdx) {
        parts.push(renderBold(text.slice(lastIdx, match.index)));
      }
      const label = match[1];
      const url = match[2];
      parts.push(
        <a
          key={match.index}
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="font-bold text-volcano-main underline hover:text-volcano-dark transition-colors"
        >
          {label}
        </a>
      );
      lastIdx = linkRegex.lastIndex;
    }
    if (lastIdx < text.length) {
      parts.push(renderBold(text.slice(lastIdx)));
    }
    return parts.length > 0 ? parts : renderBold(text);
  };

  const lines = content.split("\n");

  return (
    <div className="space-y-1 text-xs md:text-sm leading-relaxed text-gray-800">
      {lines.map((line, idx) => {
        const trimmed = line.trim();

        if (trimmed === "---" || trimmed === "***" || trimmed === "___") {
          return <hr key={idx} className="my-2 border-t border-volcano-dark/10" />;
        }

        if (trimmed.startsWith("### ") || trimmed.startsWith("## ") || trimmed.startsWith("# ")) {
          const headerText = trimmed.replace(/^#+\s*/, "");
          return (
            <h4 key={idx} className="mt-2.5 mb-1 font-black text-volcano-dark text-xs md:text-sm tracking-tight border-b border-volcano-dark/10 pb-1">
              {renderInline(headerText)}
            </h4>
          );
        }

        if (/^[\*\-\+]\s+/.test(trimmed) || /^\d+\.\s+/.test(trimmed)) {
          const isNumbered = /^\d+\.\s+/.test(trimmed);
          const numMatch = trimmed.match(/^\d+\./);
          const listText = trimmed.replace(/^([\*\-\+]|\d+\.)\s+/, "");
          return (
            <div key={idx} className="flex items-start gap-1.5 my-0.5 pl-0.5">
              <span className="shrink-0 font-bold text-volcano-orange text-xs mt-0.5">
                {isNumbered ? `${numMatch?.[0]} ` : "• "}
              </span>
              <div className="flex-1">{renderInline(listText)}</div>
            </div>
          );
        }

        if (!trimmed) {
          return <div key={idx} className="h-1" />;
        }

        return (
          <p key={idx} className="my-0.5">
            {renderInline(line)}
          </p>
        );
      })}
    </div>
  );
}

export default function YotaChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([WELCOME_MESSAGE]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messageListRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    messageListRef.current?.scrollTo({
      top: messageListRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [isOpen, isLoading, messages]);

  const sendMessage = async (content: string) => {
    const text = content.trim();
    if (!text || isLoading) return;

    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content: text,
    };
    const nextMessages = [...messages, userMessage];
    setMessages(nextMessages);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: nextMessages
            .filter((message) => message.id !== "welcome")
            .slice(-12)
            .map(({ role, content: messageContent }) => ({ role, content: messageContent })),
        }),
      });
      const data = (await response.json()) as { answer?: string; error?: string };
      if (!response.ok || !data.answer) throw new Error(data.error ?? "Jawaban tidak tersedia.");

      setMessages((current) => [
        ...current,
        { id: crypto.randomUUID(), role: "assistant", content: data.answer as string },
      ]);
    } catch (error) {
      setMessages((current) => [
        ...current,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          content: error instanceof Error
            ? error.message
            : "YOTA AI sedang tidak tersedia. Silakan coba kembali.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    void sendMessage(input);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      void sendMessage(input);
    }
  };

  return (
    <div className="fixed bottom-5 right-4 z-[5000] sm:right-6">
      {isOpen && (
        <section
          className="mb-3 flex h-[min(640px,calc(100vh-6.5rem))] w-[min(400px,calc(100vw-2rem))] flex-col overflow-hidden rounded-[30px] border border-volcano-dark/15 bg-white shadow-[0_25px_80px_rgba(94,0,6,.3)] backdrop-blur-xl animate-in fade-in slide-in-from-bottom-4 duration-300"
          aria-label="Percakapan dengan YOTA AI"
        >
          {/* HEADER CHAT DENGAN MASKOT */}
          <header className="relative flex items-center justify-between gap-4 overflow-hidden bg-gradient-to-r from-volcano-dark via-[#7b0a08] to-volcano-main px-5 py-3.5 text-white shadow-md">
            {/* Background Glow */}
            <div className="absolute -top-10 -right-10 size-32 rounded-full bg-volcano-orange/30 blur-2xl pointer-events-none" />

            <div className="flex items-center gap-3.5 relative z-10">
              {/* Maskot Avatar Frame */}
              <div className="relative size-11 shrink-0 rounded-2xl bg-gradient-to-br from-volcano-sand to-white p-0.5 shadow-lg ring-2 ring-white/20">
                <div className="relative size-full overflow-hidden rounded-[14px] bg-volcano-dark/10">
                  <Image
                    src="/maskot.webp"
                    alt="Maskot YOTA AI"
                    fill
                    sizes="44px"
                    className="object-cover object-center"
                    priority
                  />
                </div>
                {/* Online Indicator Badge */}
                <span className="absolute -bottom-0.5 -right-0.5 flex size-3.5 items-center justify-center">
                  <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative size-2.5 rounded-full bg-emerald-500 ring-2 ring-white" />
                </span>
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <h2 className="font-black tracking-wide text-base leading-tight">YOTA AI</h2>
                  <span className="rounded-md bg-white/15 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-volcano-sand">
                    Mitigasi 24/7
                  </span>
                </div>
                <p className="text-[11px] text-volcano-sand/90 font-medium">Asisten Kesiapsiagaan Bencana</p>
              </div>
            </div>

            <div className="flex items-center gap-1 relative z-10">
              <button
                type="button"
                onClick={() => setMessages([WELCOME_MESSAGE])}
                className="grid size-8 place-items-center rounded-xl text-white/80 transition hover:bg-white/15 hover:text-white"
                aria-label="Hapus percakapan"
                title="Hapus percakapan"
              >
                <svg viewBox="0 0 24 24" className="size-4.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <path d="M4 7h16M9 7V4h6v3m-8 0 1 13h8l1-13" />
                </svg>
              </button>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="grid size-8 place-items-center rounded-xl text-white/80 transition hover:bg-white/15 hover:text-white"
                aria-label="Tutup chat"
              >
                <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <path d="m6 6 12 12M18 6 6 18" />
                </svg>
              </button>
            </div>
          </header>

          {/* AREA PESAN CHAT */}
          <div ref={messageListRef} className="flex-1 space-y-4 overflow-y-auto bg-gradient-to-b from-canvas/80 via-white to-canvas/40 p-4" aria-live="polite">
            {messages.map((message) => (
              <div key={message.id} className={`flex items-start gap-2.5 ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                {/* Avatar Maskot untuk pesan Assistant */}
                {message.role === "assistant" && (
                  <div className="relative size-8 shrink-0 rounded-xl bg-gradient-to-br from-volcano-sand to-white p-0.5 shadow-sm border border-volcano-dark/10 mt-0.5">
                    <div className="relative size-full overflow-hidden rounded-[10px]">
                      <Image
                        src="/maskot.webp"
                        alt="YOTA AI"
                        fill
                        sizes="32px"
                        className="object-cover"
                      />
                    </div>
                  </div>
                )}

                <div className={`max-w-[85%] rounded-2xl px-4 py-3 text-xs md:text-sm shadow-sm transition-all ${
                  message.role === "user"
                    ? "rounded-br-sm bg-volcano-main text-white shadow-volcano-main/10"
                    : "rounded-bl-sm border border-volcano-dark/10 bg-white"
                }`}>
                  <FormattedMessage content={message.content} isUser={message.role === "user"} />
                </div>
              </div>
            ))}

            {/* Indicator Loading ketika AI mengetik */}
            {isLoading && (
              <div className="flex items-start gap-2.5 justify-start">
                <div className="relative size-8 shrink-0 rounded-xl bg-gradient-to-br from-volcano-sand to-white p-0.5 shadow-sm border border-volcano-dark/10 mt-0.5">
                  <div className="relative size-full overflow-hidden rounded-[10px]">
                    <Image
                      src="/maskot.webp"
                      alt="YOTA AI"
                      fill
                      sizes="32px"
                      className="object-cover"
                    />
                  </div>
                </div>
                <div className="flex items-center gap-1.5 rounded-2xl rounded-bl-sm border border-volcano-dark/10 bg-white px-4 py-3 shadow-sm" aria-label="YOTA AI sedang berpikir">
                  {[0, 1, 2].map((item) => (
                    <span key={item} className="size-2 animate-bounce rounded-full bg-volcano-orange" style={{ animationDelay: `${item * 150}ms` }} />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* REKOMENDASI PERTANYAAN (SUGGESTIONS) */}
          {messages.length === 1 && (
            <div className="border-t border-volcano-dark/5 bg-gray-50/80 px-4 py-3">
              <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-gray-400">Saran Pertanyaan:</p>
              <div className="flex flex-wrap gap-1.5">
                {SUGGESTIONS.map((suggestion) => (
                  <button
                    key={suggestion}
                    type="button"
                    onClick={() => void sendMessage(suggestion)}
                    className="rounded-xl border border-volcano-orange/20 bg-white px-3 py-1.5 text-[11px] font-semibold text-volcano-dark shadow-sm transition hover:border-volcano-orange/50 hover:bg-volcano-sand/30 active:scale-95 text-left"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* INPUT FORM CHAT */}
          <form onSubmit={handleSubmit} className="border-t border-volcano-dark/10 bg-white p-3">
            <div className="flex items-end gap-2 rounded-2xl bg-volcano-dark/5 p-2 transition-within focus-within:bg-white focus-within:ring-2 focus-within:ring-volcano-orange/40 border border-transparent focus-within:border-volcano-orange/30">
              <textarea
                value={input}
                onChange={(event) => setInput(event.target.value.slice(0, 1_500))}
                onKeyDown={handleKeyDown}
                rows={1}
                placeholder="Tanyakan sesuatu kepada YOTA AI..."
                className="max-h-28 min-h-10 flex-1 resize-none bg-transparent px-2 py-2 text-xs md:text-sm text-gray-800 outline-none placeholder:text-gray-400"
                aria-label="Pesan"
              />
              <button
                type="submit"
                disabled={!input.trim() || isLoading}
                className="grid size-10 shrink-0 place-items-center rounded-xl bg-gradient-to-r from-volcano-main to-volcano-dark text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40 shadow-sm"
                aria-label="Kirim pesan"
              >
                <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="m4 4 17 8-17 8 3-8-3-8Z" />
                  <path d="M7 12h14" />
                </svg>
              </button>
            </div>
            <p className="mt-2 px-1 text-center text-[9px] text-gray-400">YOTA AI berbasis data resmi PVMBG, BNPB & BMKG. Ikuti juga arahan petugas lapangan.</p>
          </form>
        </section>
      )}

      {/* FLOATING TRIGGER BUTTON DENGAN MASKOT AVATAR */}
      <button
        type="button"
        onClick={() => setIsOpen((value) => !value)}
        className="group relative ml-auto flex h-14 items-center gap-3 rounded-full bg-gradient-to-r from-volcano-dark via-[#7b0a08] to-volcano-main px-4 text-white shadow-[0_12px_40px_rgba(94,0,6,.4)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_16px_50px_rgba(94,0,6,.5)] active:scale-95 border border-white/20"
        aria-label={isOpen ? "Tutup YOTA AI" : "Buka YOTA AI"}
        aria-expanded={isOpen}
      >
        {/* Maskot Avatar pada Button Trigger */}
        <div className="relative size-10 shrink-0 rounded-full bg-gradient-to-br from-volcano-sand to-white p-0.5 shadow-md">
          <div className="relative size-full overflow-hidden rounded-full">
            <Image
              src="/maskot.webp"
              alt="Maskot YOTA"
              fill
              sizes="40px"
              className="object-cover transition-transform duration-300 group-hover:scale-110"
            />
          </div>
          {!isOpen && (
            <span className="absolute -top-0.5 -right-0.5 flex size-3.5 items-center justify-center">
              <span className="absolute inline-flex size-full animate-ping rounded-full bg-orange-400 opacity-75" />
              <span className="relative size-2.5 rounded-full bg-volcano-orange ring-2 ring-white" />
            </span>
          )}
        </div>

        <div className="flex flex-col text-left pr-1">
          <span className="text-xs font-black tracking-wide leading-tight">YOTA AI</span>
          <span className="text-[10px] text-volcano-sand/90 font-semibold">{isOpen ? "Tutup Percakapan" : "Tanya Masalah Erupsi"}</span>
        </div>

        <span className="ml-1 grid size-7 place-items-center rounded-full bg-white/15 text-white transition-transform group-hover:rotate-90">
          <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="2.5">
            {isOpen ? <path d="m6 6 12 12M18 6 6 18" /> : <path d="m9 18 6-6-6-6" />}
          </svg>
        </span>
      </button>
    </div>
  );
}


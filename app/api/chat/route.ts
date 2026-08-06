type ChatRole = "user" | "assistant";

interface ChatMessage {
  role: ChatRole;
  content: string;
}

interface OpenRouterResponse {
  choices?: Array<{ message?: { content?: string } }>;
  error?: { message?: string };
}


const SYSTEM_PROMPT = `Anda adalah YOTA AI, asisten kesiapsiagaan bencana Gunung Ruang yang terintegrasi dalam portal YOTA (https://yotagis.vercel.app).
Jawab dalam Bahasa Indonesia yang jelas, ringkas, tenang, dan mudah dipahami.
Prioritaskan keselamatan jiwa serta arahkan pengguna mengikuti PVMBG, BNPB, BMKG, BPBD, dan petugas setempat.
Jangan mengarang status gunung, lokasi posko, atau kondisi real-time. Jika data terkini tidak tersedia, katakan dengan jujur dan arahkan ke sumber resmi.
Untuk keadaan darurat, sarankan segera menjauh dari zona bahaya dan menghubungi 112, 117 BNPB, atau petugas setempat.
Jelaskan bahwa jawaban AI bukan pengganti instruksi resmi.

=== INFORMASI WEBSITE YOTA ===

YOTA adalah portal WebGIS (Web Geographic Information System) mitigasi, pemantauan, dan tanggap darurat Gunung Ruang di Kepulauan Sitaro, Sulawesi Utara. Website ini memiliki 3 halaman utama:
1. Mitigasi (halaman utama) — Peta zonasi bencana, potensi bahaya, ceklis tas siaga, panduan mengurangi risiko
2. Tanggap Darurat — Peta sebaran posko evakuasi real-time, status logistik, jumlah pengungsi
3. Pasca-bencana — Arsip historis erupsi (grafik VEI), simulasi 3D laboratorium geofisika, form evaluasi

Fitur unggulan:
- Peta WebGIS interaktif dengan 3 pilihan layer: Peta Standar (OSM), Citra Satelit (Esri), Peta Topografi
- Simulasi 3D erupsi Gunung Ruang (Three.js) dengan kontrol tekanan magma, viskositas, kecepatan angin
- Notifikasi push real-time saat status gunung berubah (via Supabase Realtime)
- Dashboard petugas BPBD dan relawan untuk update status gunung dan logistik posko

=== DATA GUNUNG RUANG ===

- Nama: Gunung Ruang (Gunung Api Ruang)
- Lokasi: Pulau Ruang, Kepulauan Sitaro, Sulawesi Utara
- Koordinat: 2.30597°LU, 125.36680°BT
- Ketinggian: 725 mdpl (meter di atas permukaan laut)
- Tipe: Stratovolcano
- Kekuatan Erupsi: VEI 4 (Volcanic Explosivity Index skala 4 — "Cataclysmic")
- Erupsi besar terakhir: 2024 (16-30 April 2024)
- Jiwa rentan: ±12.000 jiwa dalam radius 7 km
- Potensi ikutan: Tsunami vulkanik (akibat material vulkanik masuk ke laut)

=== 6 POTENSI BAHAYA GUNUNG RUANG ===

1. Awan Panas (Pyroclastic): Gas panas ≥700°C bercampur material padat. Kecepatan hingga 700 km/jam. Satu-satunya perlindungan adalah evakuasi segera.
2. Lahar & Aliran Lava: Lahar dingin terbentuk saat hujan deras pasca erupsi. Tetap waspada di alur sungai hingga berminggu-minggu setelah letusan.
3. Hujan Abu & Gas SO₂: Mengganggu pernapasan dan penglihatan. Tutup sumur & tandon air. Gunakan masker N95 dan kacamata pelindung.
4. Tsunami Vulkanik: Erupsi masif atau longsor bawah laut dapat memicu gelombang. Tanda: air laut surut tiba-tiba → segera lari ke dataran tinggi.
5. Lontaran Batu dan Pasir: Material padat yang terlempar dari kawah saat letusan eksplosif.
6. Gempa Bumi Vulkanik: Getaran tanah yang disebabkan oleh pergerakan magma sebelum atau saat letusan, yang dapat meruntuhkan bangunan.

=== PROTOKOL AKSI PER LEVEL STATUS ===

Level I — Normal: Aktivitas normal. Pantau informasi PVMBG secara berkala. Pastikan tas siaga selalu terisi dan siap dibawa.
Level II — Waspada: Dilarang mendaki radius 2 km. Warga dalam radius 4 km bersiap evakuasi sewaktu-waktu. Ikuti arahan resmi BPBD.
Level III — Siaga: Warga dalam radius 4 km wajib mengungsi. Jauhi alur sungai. Aktifkan jalur komunikasi darurat keluarga.
Level IV — Awas: Evakuasi massal seluruh penduduk radius 7 km. Tinggalkan harta benda — utamakan keselamatan jiwa. Waspadai tsunami!

=== CEKLIS TAS SIAGA BENCANA ===

Dokumen & Identitas (Simpan dalam plastik zip-lock, kedap air):
- KTP, Kartu Keluarga, Akta Lahir
- Buku Tabungan & Sertifikat Aset
- Ijazah & Surat Berharga

Perlengkapan Darurat (Tas Siaga):
- Air minum 2 Liter + Makanan awet untuk 3 hari (biskuit, sarden kaleng, makanan bayi)
- Obat-obatan rutin & Kotak P3K (siapkan resep dokter minimal 7 hari)
- Senter, baterai cadangan / Power bank
- Masker N95 (perlindungan debu vulkanik)
- Peluit & Radio portabel (untuk memantau siaran darurat BPBD)

=== PANDUAN MENGURANGI RISIKO BENCANA GUNUNG MELETUS (13 LANGKAH) ===

1. Tutup rapat jendela, pintu, dan lubang angin rumah
2. Lindungi kendaraan bermotor atau peralatan mesin lainnya dan matikan mesinnya
3. Kumpulkan keluarga, ambil tas yang sudah disiapkan, dan segera mengungsi
4. Kenakan pakaian yang melindungi tubuh (baju panjang, topi, dll)
5. Gunakan kacamata atau apapun untuk mencegah debu masuk mata
6. Jangan memakai lensa kontak
7. Pakai masker atau kain untuk menutup mulut dan hidung
8. Menutup wajah dengan kedua belah tangan saat abu letusan gunung turun
9. Dengarkan instruksi pihak berwenang dan ikuti rute mengungsi yang ditetapkan
10. Hindari lokasi rawan (lereng gunung, lembah, sungai kering, aliran lahar)
11. Usahakan masuk ke ruang lindung darurat / bunker
12. Siapkan diri menghadapi bencana susulan

=== LOKASI TITIK KUMPUL & POSKO EVAKUASI ===

Pusat Pengungsian (Posko Terpusat):
- Kantor Desa Apengsala, Elevasi: 47.0m
- Kantor Desa Lumbo, Elevasi: 173.8m

Posko Sementara:
- Gereja GMIST Apengsara, Elevasi: 66.9m
- Gereja GMIST Boto, Elevasi: 159.8m
- Gereja GMIST Mohongsawang, Elevasi: 11.7m
- Gereja GPDI Boto, Elevasi: 200.5m
- Kantor Camat Tagulandang Utara, Elevasi: 173.2m
- SDN Inpres Mohongsawang, Elevasi: 10.6m
- SMK Negeri 1 Tagulandang Utara, Elevasi: 166.4m
- SPPG Tagulandang Selatan, Elevasi: 7.5m
- SPPG Tagulandang Utara, Elevasi: 6.1m

Drop Point Bantuan:
- Kantor Gubernur Sulut (Pusat Distribusi Bantuan Utama), Manado

Bandara Terdampak:
- Bandara Sam Ratulangi Manado
- Bandara Taman Bung Karno Siau
- Bandara Naha Tahuna
- Bandara Djalaludin Gorontalo

=== RIWAYAT ERUPSI GUNUNG RUANG (VEI) ===

1808: VEI 2 (Explosive) | 1836: VEI 2 | 1840: VEI 2 | 1856: VEI 1 (Severe)
1870: VEI 3 (Catastrophic) | 1871: VEI 2 | 1874: VEI 2 | 1889: VEI 1
1904: VEI 3 (Catastrophic) | 1914: VEI 2 | 1949: VEI 2
2002: VEI 4 (Cataclysmic) | 2024: VEI 4 (Cataclysmic)

VEI (Volcanic Explosivity Index) adalah skala 0-8 yang mengukur volume material letusan gunung berapi:
- VEI 0-1: Non-explosive hingga gentle
- VEI 2: Explosive
- VEI 3: Catastrophic (Severe)
- VEI 4: Cataclysmic (seperti erupsi Gunung Ruang 2002 dan 2024)
- VEI 5-8: Paroxysmal hingga mega-colossal

=== DATA ERUPSI APRIL 2024 ===

- Tanggal mulai: 16 April 2024, pukul 21:45 WITA
- Kolom abu: 3.000–5.000 meter
- Jumlah evakuasi: ±11.615 jiwa (total ±12.000)
- Status saat erupsi: Level IV (AWAS)
- Potensi tsunami: YA
- Estimasi kerugian: Rp 300 Miliar+
- Rumah rusak: 3.000+
- Desa direlokasi: 2 desa

=== SUMBER INFORMASI RESMI ===

- Magma Indonesia (PVMBG) — magma.esdm.go.id — Laporan harian & rekomendasi status
- inaRISK (BNPB) — inarisk.bnpb.go.id — Peta risiko bencana nasional
- BMKG — bmkg.go.id — Peringatan dini cuaca & tsunami
- Radio Darurat Sitaro — FM 103.5 MHz — Siaran koordinasi evakuasi lokal

=== KONTAK DARURAT ===

- Hotline BNPB: 117
- Nomor darurat: 112, 119
- Email layanan posko: posko@yota.id

=== INSTRUKSI MENJAWAB & FORMATTING ===

1. Jawablah pertanyaan secara lengkap, jelas, runtut, dan tuntas sampai selesai. Jangan memotong penjelasan atau daftar di tengah-tengah.
2. Susun jawaban dengan rapi, bersih, dan enak dibaca. Gunakan emoji yang sesuai di setiap poin/kategori (misalnya: 📍 lokasi, 🏢 posko terpusat, ⛺ posko sementara, 📦 logistik, 📞 kontak darurat, ⚠️ peringatan, ✈️ bandara).
3. Gunakan judul bagian (heading) yang singkat dan jelas tanpa berlebihan menggunakan garis pemisah (---).
4. Gunakan poin-poin (bullet points) yang rapi untuk daftar lokasi, bahaya, atau langkah-langkah.
5. Berikan salam ramah di awal dan catatan penutup yang menenangkan di akhir.`;

const MAX_MESSAGES = 12;
const MAX_MESSAGE_LENGTH = 1_500;
const MAX_TOTAL_LENGTH = 12_000;

function parseMessages(value: unknown): ChatMessage[] | null {
  if (!Array.isArray(value) || value.length === 0 || value.length > MAX_MESSAGES) return null;

  const messages: ChatMessage[] = [];
  let totalLength = 0;

  for (const item of value) {
    if (!item || typeof item !== "object") return null;
    const candidate = item as Record<string, unknown>;
    if (candidate.role !== "user" && candidate.role !== "assistant") return null;
    if (typeof candidate.content !== "string") return null;

    const content = candidate.content.trim();
    if (!content || content.length > MAX_MESSAGE_LENGTH) return null;
    totalLength += content.length;
    if (totalLength > MAX_TOTAL_LENGTH) return null;
    messages.push({ role: candidate.role, content });
  }

  return messages;
}

async function requestOpenRouter(messages: ChatMessage[]) {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) throw new Error("OPENROUTER_API_KEY belum dikonfigurasi.");

  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "HTTP-Referer": process.env.APP_URL ?? "http://localhost:3000",
      "X-Title": "YOTA",
    },
    body: JSON.stringify({
      model: process.env.OPENROUTER_MODEL ?? "~google/gemini-flash-latest",
      messages: [{ role: "system", content: SYSTEM_PROMPT }, ...messages],
      temperature: 0.35,
      max_tokens: 2048,
    }),
    signal: AbortSignal.timeout(30_000),
  });

  const data = (await response.json()) as OpenRouterResponse;
  if (!response.ok) throw new Error(data.error?.message ?? "OpenRouter tidak dapat memproses permintaan.");

  const answer = data.choices?.[0]?.message?.content?.trim();
  if (!answer) throw new Error("OpenRouter tidak mengembalikan jawaban.");
  return answer;
}

interface GeminiResponse {
  candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
  error?: { message?: string; status?: string; code?: number };
}

async function requestGemini(messages: ChatMessage[]) {
  const apiKey = process.env.GEMINI_API_KEY?.trim();
  if (!apiKey) throw new Error("GEMINI_API_KEY belum dikonfigurasi di .env.local.");

  // Build multi-turn contents array for Gemini API (role: 'user' | 'model')
  const contents = messages.map((message) => ({
    role: message.role === "user" ? "user" : "model",
    parts: [{ text: message.content }],
  }));

  const MODELS_TO_TRY = Array.from(
    new Set([
      process.env.GEMINI_MODEL || "gemini-3.6-flash",
      "gemini-3.6-flash",
      "gemini-3.5-flash",
      "gemini-3.1-flash-lite",
      "gemini-flash-latest",
      "gemini-2.0-flash",
    ]),
  );

  let lastError: Error | null = null;

  for (const modelName of MODELS_TO_TRY) {
    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            system_instruction: {
              parts: [{ text: SYSTEM_PROMPT }],
            },
            contents,
            generationConfig: {
              temperature: 0.35,
              maxOutputTokens: 2048,
            },
          }),
          signal: AbortSignal.timeout(30_000),
        },
      );

      const data = (await response.json()) as GeminiResponse;

      if (!response.ok) {
        const rawMsg = data.error?.message ?? "";
        console.warn(`[YOTA Chat] Model ${modelName} gagal: (HTTP ${response.status}) ${rawMsg}`);
        if (rawMsg.includes("denied access") || rawMsg.includes("PERMISSION_DENIED") || response.status === 403) {
          lastError = new Error(
            "Kunci API Gemini tidak valid atau akses ditolak (Google AI Studio Key). Mohon perbarui GEMINI_API_KEY di .env.local.",
          );
          break;
        }
        lastError = new Error(rawMsg || `Error pada model ${modelName}`);
        continue;
      }

      const parts = data.candidates?.[0]?.content?.parts || [];
      const answer = parts
        .map((p) => p.text || "")
        .join("")
        .trim();
      if (answer) {
        return answer;
      }
    } catch (err) {
      console.warn(`[YOTA Chat] Gagal memanggil model ${modelName}:`, err);
      lastError = err instanceof Error ? err : new Error(String(err));
    }
  }

  throw lastError || new Error("Gagal mendapatkan respon dari AI.");
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { messages?: unknown };
    const messages = parseMessages(body.messages);
    if (!messages) {
      return Response.json({ error: "Format percakapan tidak valid." }, { status: 400 });
    }

    const provider = (process.env.AI_PROVIDER ?? "openrouter").toLowerCase();
    const answer = provider === "gemini"
      ? await requestGemini(messages)
      : await requestOpenRouter(messages);

    return Response.json({ answer, provider });
  } catch (error) {
    console.error("[YOTA Chat API Error]:", error);
    const message = error instanceof Error ? error.message : "Layanan AI sedang tidak tersedia.";
    const isConfigOrAuthError =
      message.includes("belum dikonfigurasi") ||
      message.includes("tidak valid") ||
      message.includes("akses ditolak") ||
      message.includes("Kuota");

    return Response.json(
      { error: message },
      { status: isConfigOrAuthError ? 503 : 502 },
    );
  }
}

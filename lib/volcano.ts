export interface VolcanoStatus {
  level: number;
  name: string;
  roman: string;
  description: string;
  lastUpdated: string;
}

export const DEFAULT_VOLCANO_STATUS: VolcanoStatus = {
  level: 2,
  name: "Waspada",
  roman: "II",
  description: "Aktivitas vulkanik menunjukkan peningkatan. Masyarakat diimbau untuk tidak mendekati kawah.",
  lastUpdated: "Menunggu pembaruan",
};

const ROMAN_LEVELS = ["I", "II", "III", "IV"];

export function formatVolcanoStatus(data: {
  level: number;
  name: string;
  description: string;
  updated_at?: string;
}): VolcanoStatus {
  const date = data.updated_at ? new Date(data.updated_at) : null;
  const formattedDate = date && !Number.isNaN(date.getTime())
    ? `${date.toLocaleDateString("id-ID", {
        day: "numeric",
        month: "long",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })} WITA`
    : "Waktu pembaruan tidak tersedia";

  return {
    level: data.level,
    name: data.name,
    roman: ROMAN_LEVELS[data.level - 1] ?? "I",
    description: data.description,
    lastUpdated: formattedDate,
  };
}

export function getLevelTheme(level: number) {
  if (level === 1) return { bg: "bg-emerald-600", text: "text-emerald-700", lightBg: "bg-emerald-50", border: "border-emerald-500" };
  if (level === 3) return { bg: "bg-volcano-orange", text: "text-orange-800", lightBg: "bg-orange-50", border: "border-volcano-orange" };
  if (level === 4) return { bg: "bg-volcano-main", text: "text-volcano-main", lightBg: "bg-red-50", border: "border-volcano-main" };
  return { bg: "bg-amber-500", text: "text-amber-700", lightBg: "bg-amber-50", border: "border-amber-500" };
}

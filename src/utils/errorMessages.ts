const ERROR_MAP: [string, string][] = [
  [
    "No row records could be extracted",
    "Excel fayldan ma'lumot o'qib bo'lmadi. Faylda to'g'ri jadval va sarlavhalar mavjudligini tekshiring.",
  ],
  [
    "Blueprint has no fields",
    "Tanlangan shablon sozlanmagan. Administrator bilan bog'laning.",
  ],
  [
    "No documents were generated",
    "Hech qaysi qatorda kerakli ma'lumotlar topilmadi. Excel ustunlari shablon maydonlariga mos kelishini tekshiring.",
  ],
  [
    "No validated replacements",
    "Sun'iy intellekt hujjatdagi maydonlarni aniqlay olmadi. Hujjatda ko'rinadigan belgi va maydonlar mavjudligini tekshiring.",
  ],
  [
    "currently implemented for DOCX",
    "Hozirda faqat Word (.docx) hujjatlari qabul qilinadi.",
  ],
  [
    "Autonomous document job failed",
    "Hujjatni to'ldirishda xato yuz berdi. Qayta urinib ko'ring.",
  ],
  [
    "Document batch generation failed",
    "Hujjat yaratishda xato yuz berdi. Qayta urinib ko'ring.",
  ],
  [
    "Passwords do not match",
    "Parollar mos kelmadi.",
  ],
  [
    "Password must be at least",
    "Parol kamida 8 ta belgidan iborat bo'lishi kerak.",
  ],
];

export function mapErrorToUzbek(message: string | null | undefined): string {
  if (!message) return "Xato yuz berdi. Qayta urinib ko'ring.";

  const lower = message.toLowerCase();

  if (
    lower.includes("network error") ||
    lower.includes("econnrefused") ||
    lower.includes("failed to fetch") ||
    lower.includes("no response")
  ) {
    return "Server bilan aloqa yo'q. Internet aloqangizni tekshiring.";
  }

  if (lower.includes("401") || lower.includes("unauthorized")) {
    return "Sessiya tugadi. Iltimos, qayta kiring.";
  }

  for (const [key, value] of ERROR_MAP) {
    if (message.includes(key)) {
      return value;
    }
  }

  return "Xato yuz berdi. Qayta urinib ko'ring.";
}

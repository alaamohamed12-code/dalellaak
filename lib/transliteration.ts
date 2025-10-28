// Simple Arabic-to-English transliteration for names
// Note: This is a best-effort mapping to improve UX when English UI is active
const arabicToLatinMap: Record<string, string> = {
  'ا': 'a', 'أ': 'a', 'إ': 'i', 'آ': 'aa',
  'ب': 'b', 'ت': 't', 'ث': 'th', 'ج': 'j', 'ح': 'h', 'خ': 'kh',
  'د': 'd', 'ذ': 'dh', 'ر': 'r', 'ز': 'z', 'س': 's', 'ش': 'sh',
  'ص': 's', 'ض': 'd', 'ط': 't', 'ظ': 'z', 'ع': 'a', 'غ': 'gh',
  'ف': 'f', 'ق': 'q', 'ك': 'k', 'ل': 'l', 'م': 'm', 'ن': 'n',
  'ه': 'h', 'و': 'w', 'ؤ': 'u', 'ي': 'y', 'ى': 'a', 'ئ': 'i',
  'ة': 'a', 'ء': '',
  '٠': '0', '١': '1', '٢': '2', '٣': '3', '٤': '4', '٥': '5', '٦': '6', '٧': '7', '٨': '8', '٩': '9',
  'ﻻ': 'la', 'لا': 'la'
};

export function transliterateArabicToEnglish(input: string): string {
  if (!input) return '';
  // If no Arabic characters, return as-is
  if (!/[\u0600-\u06FF]/.test(input)) return input;
  // Replace per-character, keep spaces and punctuation
  return Array.from(input)
    .map(ch => arabicToLatinMap[ch] ?? ch)
    .join('')
    // Basic tidy-ups
    .replace(/\s{2,}/g, ' ')
    .trim()
    // Capitalize words
    .replace(/\b([a-z])(\w*)/g, (_, c1, rest) => c1.toUpperCase() + rest);
}

export function getCompanyDisplayName(company: { firstName?: string; lastName?: string }, lang: 'ar' | 'en') {
  const first = String(company.firstName || '').trim();
  const last = String(company.lastName || '').trim();
  if (lang === 'en') {
    return `${transliterateArabicToEnglish(first)} ${transliterateArabicToEnglish(last)}`.trim();
  }
  return `${first} ${last}`.trim();
}

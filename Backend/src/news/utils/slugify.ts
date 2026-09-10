// Combining diacritical marks (U+0300–U+036F) left behind by NFD normalization
// of accented Spanish characters (á é í ó ú ñ ü) — stripped by code point so the
// source file never has to embed a literal combining-mark regex.
const COMBINING_MARKS_START = 0x0300;
const COMBINING_MARKS_END = 0x036f;

function stripDiacritics(value: string): string {
  let result = '';
  for (const char of value) {
    const code = char.codePointAt(0) ?? 0;
    if (code < COMBINING_MARKS_START || code > COMBINING_MARKS_END) {
      result += char;
    }
  }
  return result;
}

export function slugify(text: string): string {
  return stripDiacritics(text.normalize('NFD'))
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

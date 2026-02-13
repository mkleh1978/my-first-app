/**
 * Splits a text string into bullet-point items.
 * Splits on commas, semicolons, and newlines.
 * Returns null when the text has no separators (single item → render as paragraph).
 */
export function splitTextToBullets(text: string): string[] | null {
  const items = text
    .split(/[,;\n]+/)
    .map((s) => s.trim())
    .filter(Boolean);

  if (items.length <= 1) return null;
  return items;
}

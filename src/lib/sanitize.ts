/**
 * Sanitize user input for use in PostgREST .or() filter strings.
 * Escapes characters that have special meaning in PostgREST filters:
 * - % and _ are SQL LIKE wildcards
 * - , . ( ) are PostgREST filter delimiters
 * - \ is the escape character itself
 */
export function sanitizeSearchInput(input: string): string {
  return input
    .replace(/\\/g, "\\\\") // escape backslash first
    .replace(/%/g, "\\%")
    .replace(/_/g, "\\_")
    .replace(/,/g, "")
    .replace(/\./g, "")
    .replace(/\(/g, "")
    .replace(/\)/g, "");
}

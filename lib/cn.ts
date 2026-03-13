/**
 * Merge class name fragments while filtering out falsy values.
 */
export function cn(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(' ');
}
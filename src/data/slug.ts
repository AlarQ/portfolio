/**
 * The single slug-validation gate shared by every content loader (Blog Posts,
 * Projects, …). Lowercase alphanumeric + hyphen only - rejects uppercase,
 * whitespace, and traversal segments (`../`) alike, since none of those
 * characters are in the allow-list. Extracted so the gate cannot drift
 * between `postLoader.ts` and `projectLoader.ts` (security/input-validation.md:
 * one authoritative allow-list, not two that can diverge).
 */
export const SLUG_PATTERN = /^[a-z0-9-]+$/;

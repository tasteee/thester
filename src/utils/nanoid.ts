/** Tiny cryptographically-random ID generator. */
export function nanoid(size = 12): string {
  const bytes = crypto.getRandomValues(new Uint8Array(size));
  return btoa(String.fromCharCode(...bytes))
    .replace(/[+/=]/g, '')
    .slice(0, size);
}

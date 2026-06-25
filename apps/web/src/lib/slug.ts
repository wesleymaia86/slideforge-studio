/** Gera slug URL-safe a partir de nome. */
export function slugifyName(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

const SLUG_RE = /^[a-z0-9-]+$/

export function isValidSlug(slug: string): boolean {
  return slug.length >= 2 && SLUG_RE.test(slug)
}

/** Garante slug não vazio e válido para API. */
export function ensureSlug(name: string, slug: string): string {
  const trimmed = slug.trim()
  if (trimmed && isValidSlug(trimmed)) return trimmed
  const fromName = slugifyName(name)
  if (fromName && isValidSlug(fromName)) return fromName
  return `ws-${Date.now()}`
}

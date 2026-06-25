import pt from './pt-BR'

type NestedStrings = { [key: string]: string | NestedStrings }

function resolve(obj: NestedStrings, key: string): string | undefined {
  let current: string | NestedStrings | undefined = obj
  for (const part of key.split('.')) {
    if (!current || typeof current === 'string') return undefined
    current = current[part]
  }
  return typeof current === 'string' ? current : undefined
}

/** Retorna string pt-BR. Suporta `{var}` em templates. */
export function t(key: string, vars?: Record<string, string | number>): string {
  const raw = resolve(pt as NestedStrings, key) ?? key
  if (!vars) return raw
  return Object.entries(vars).reduce(
    (acc, [k, v]) => acc.replace(new RegExp(`\\{${k}\\}`, 'g'), String(v)),
    raw,
  )
}

export { pt as strings }

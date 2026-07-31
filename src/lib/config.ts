function publicHttpUrl(value: string | undefined): string {
  if (!value?.trim()) return ''
  try {
    const url = new URL(value.trim())
    return url.protocol === 'https:' || url.protocol === 'http:' ? url.toString() : ''
  } catch {
    return ''
  }
}

export const sourceUrl = publicHttpUrl(import.meta.env.VITE_SOURCE_URL)

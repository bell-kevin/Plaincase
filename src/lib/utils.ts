import { differenceInCalendarDays, format, formatDistanceToNowStrict, parseISO } from 'date-fns'

export function makeId(prefix: string): string {
  return `${prefix}_${crypto.randomUUID()}`
}

export async function hashBlob(blob: Blob): Promise<string> {
  const buffer = await blob.arrayBuffer()
  const digest = await crypto.subtle.digest('SHA-256', buffer)
  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('')
}

export function formatDate(value?: string, style: 'short' | 'long' = 'short'): string {
  if (!value) return 'No date'
  const pattern = style === 'long' ? 'MMMM d, yyyy' : 'MMM d, yyyy'
  return format(parseISO(value), pattern)
}

export function formatDateTime(value: string): string {
  return format(parseISO(value), "MMM d, yyyy 'at' h:mm a")
}

export function relativeDate(value?: string): string {
  if (!value) return 'No target date'
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    const days = differenceInCalendarDays(parseISO(value), new Date())
    if (days === 0) return 'today'
    if (days === 1) return 'tomorrow'
    if (days === -1) return 'yesterday'
    return days > 0 ? `in ${days} days` : `${Math.abs(days)} days ago`
  }
  return formatDistanceToNowStrict(parseISO(value), { addSuffix: true })
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`
}

export function formatMoney(amount?: number): string {
  if (amount === undefined) return 'Not tracked'
  const hasCents = !Number.isInteger(amount)
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: hasCents ? 2 : 0,
    maximumFractionDigits: 2,
  }).format(amount)
}

export function shortHash(hash: string): string {
  return `${hash.slice(0, 8)}…${hash.slice(-6)}`
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value))
}

export function sanitizeFilename(value: string): string {
  return value
    .trim()
    .replace(/[<>:"/\\|?*\u0000-\u001f]/g, '-')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 90)
}

export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = filename
  document.body.appendChild(anchor)
  anchor.click()
  anchor.remove()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

export async function copyText(text: string): Promise<void> {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text)
    return
  }
  const textarea = document.createElement('textarea')
  textarea.value = text
  textarea.style.position = 'fixed'
  textarea.style.opacity = '0'
  document.body.appendChild(textarea)
  textarea.select()
  document.execCommand('copy')
  textarea.remove()
}

export function escapeCsv(value: string | number | undefined): string {
  let text = value === undefined ? '' : String(value)
  if (/^[=+\-@\t\r]/.test(text)) text = `'${text}`
  return `"${text.replaceAll('"', '""')}"`
}

export async function blobToDataUrl(blob: Blob): Promise<string> {
  return await new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result))
    reader.onerror = () => reject(reader.error)
    reader.readAsDataURL(blob)
  })
}

export function dataUrlToBlob(dataUrl: string): Blob {
  const [header, body] = dataUrl.split(',')
  if (!header || body === undefined) throw new Error('Invalid data URL in backup')
  const mimeType = header.match(/data:(.*?);base64/)?.[1] ?? 'application/octet-stream'
  const binary = atob(body)
  const bytes = new Uint8Array(binary.length)
  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index)
  }
  return new Blob([bytes], { type: mimeType })
}

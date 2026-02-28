import type { FileItem, FileCategory } from './types'


export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
}

export function getFileIcon(mimeType: string): string {
  if (mimeType.startsWith('image/')) return 'image'
  if (mimeType.startsWith('video/')) return 'video'
  if (mimeType.startsWith('audio/')) return 'audio'
  if (mimeType === 'application/pdf') return 'pdf'
  if (
    mimeType.includes('spreadsheet') ||
    mimeType.includes('excel') ||
    mimeType === 'text/csv'
  )
    return 'spreadsheet'
  if (
    mimeType.includes('presentation') ||
    mimeType.includes('powerpoint')
  )
    return 'presentation'
  if (
    mimeType.includes('document') ||
    mimeType.includes('word') ||
    mimeType === 'text/plain'
  )
    return 'document'
  if (mimeType.includes('zip') || mimeType.includes('compressed'))
    return 'archive'
  return 'file'
}

export function getFileColor(mimeType: string): string {
  const type = getFileIcon(mimeType)
  switch (type) {
    case 'image':
      return 'text-pink-500'
    case 'video':
      return 'text-red-500'
    case 'audio':
      return 'text-orange-500'
    case 'pdf':
      return 'text-red-600'
    case 'spreadsheet':
      return 'text-emerald-500'
    case 'presentation':
      return 'text-amber-500'
    case 'document':
      return 'text-blue-500'
    case 'archive':
      return 'text-purple-500'
    default:
      return 'text-muted-foreground'
  }
}

export function getFileCategory(mimeType: string): FileCategory {
  if (mimeType.startsWith('image/')) return 'images'
  if (mimeType.startsWith('video/')) return 'videos'
  if (
    mimeType === 'application/pdf' ||
    mimeType.includes('document') ||
    mimeType.includes('word') ||
    mimeType.includes('spreadsheet') ||
    mimeType.includes('excel') ||
    mimeType.includes('presentation') ||
    mimeType.includes('powerpoint') ||
    mimeType === 'text/plain' ||
    mimeType === 'text/csv'
  )
    return 'documents'
  return 'others'
}

/**
 * Helper to generate unique identifiers locally if needed.
 */
export function generateId(): string {
  return crypto.randomUUID()
}

// End of file-helpers.ts

'use client'

import { getFileIcon, getFileColor } from '@/lib/file-helpers'
import { cn } from '@/lib/utils'
import {
  Image,
  Video,
  Music,
  FileText,
  FileSpreadsheet,
  Presentation,
  FileArchive,
  File,
} from 'lucide-react'

interface FileIconProps {
  mimeType: string
  className?: string
  size?: 'sm' | 'md' | 'lg'
}

const iconMap: Record<string, React.ElementType> = {
  image: Image,
  video: Video,
  audio: Music,
  pdf: FileText,
  spreadsheet: FileSpreadsheet,
  presentation: Presentation,
  document: FileText,
  archive: FileArchive,
  file: File,
}

const sizeMap = {
  sm: 'h-5 w-5',
  md: 'h-8 w-8',
  lg: 'h-12 w-12',
}

export function FileIcon({ mimeType, className, size = 'md' }: FileIconProps) {
  const iconType = getFileIcon(mimeType)
  const colorClass = getFileColor(mimeType)
  const Icon = iconMap[iconType] || File

  return <Icon className={cn(sizeMap[size], colorClass, className)} />
}

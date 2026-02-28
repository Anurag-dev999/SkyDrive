'use client'

import { useApp } from '@/context/app-context'
import type { FileItem } from '@/lib/types'
import { formatFileSize, getFileIcon } from '@/lib/file-helpers'
import { FileIcon } from './file-icon'
import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Calendar, HardDrive, FileType, Share2 } from 'lucide-react'

interface FilePreviewProps {
  file: FileItem | null
  open: boolean
  onClose: () => void
}

export function FilePreview({ file, open, onClose }: FilePreviewProps) {
  const { getSignedUrl } = useApp()
  const [signedUrl, setSignedUrl] = useState<string | null>(null)

  useEffect(() => {
    let active = true

    if (!file || !open || !file.mime_type.startsWith('image/')) {
      setSignedUrl(null)
      return () => {
        active = false
      }
    }

    setSignedUrl(null)
    getSignedUrl(file.file_path).then((url) => {
      if (active) {
        setSignedUrl(url)
      }
    })

    return () => {
      active = false
    }
  }, [file?.id, file?.file_path, file?.mime_type, open, getSignedUrl])

  if (!file) return null

  const iconType = getFileIcon(file.mime_type)
  const previewUrl = signedUrl || file.thumbnail_url
  const hasImagePreview = file.mime_type.startsWith('image/')

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-foreground flex items-center gap-2 text-base">
            <FileIcon mimeType={file.mime_type} size="sm" />
            <span className="truncate">{file.file_name}</span>
          </DialogTitle>
        </DialogHeader>

        <div className="mb-4 flex h-72 w-full items-center justify-center overflow-hidden rounded-xl bg-secondary/50">
          {hasImagePreview && previewUrl ? (
            <img
              src={previewUrl}
              alt={file.file_name}
              className="h-full w-full object-contain object-center"
              crossOrigin="anonymous"
            />
          ) : (
            <div className="flex flex-col items-center justify-center p-12">
              <FileIcon mimeType={file.mime_type} size="lg" />
              <p className="mt-4 text-sm font-medium text-foreground capitalize">{iconType} File</p>
              <p className="text-xs text-muted-foreground">{file.mime_type}</p>
            </div>
          )}
        </div>

        <Separator />

        <div className="flex flex-col gap-3 py-2">
          <div className="flex items-center gap-3">
            <HardDrive className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground">Size</p>
              <p className="text-sm font-medium text-foreground">{formatFileSize(file.file_size)}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground">Uploaded</p>
              <p className="text-sm font-medium text-foreground">
                {new Date(file.upload_date).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <FileType className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground">Type</p>
              <p className="text-sm font-medium text-foreground font-mono">{file.mime_type}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Share2 className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground">Sharing</p>
              {file.is_shared ? (
                <Badge variant="secondary" className="text-xs">Shared</Badge>
              ) : (
                <p className="text-sm font-medium text-foreground">Private</p>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

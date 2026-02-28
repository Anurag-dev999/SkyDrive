'use client'

import type { FileItem } from '@/lib/types'
import { formatFileSize } from '@/lib/file-helpers'
import { FileActions } from './file-actions'
import { Badge } from '@/components/ui/badge'
import { Share2 } from 'lucide-react'
import { FileThumbnail } from './file-thumbnail'

interface FileGridProps {
  files: FileItem[]
  onPreview: (file: FileItem) => void
}

export function FileGrid({ files, onPreview }: FileGridProps) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
      {files.map((file) => (
          <div
            key={file.id}
            className="group relative flex flex-col rounded-xl border border-border bg-card overflow-hidden transition-all hover:shadow-md hover:border-primary/30 cursor-pointer"
            onClick={() => onPreview(file)}
            draggable={false}
            onDragStart={(e) => e.preventDefault()}
          >
          {/* Thumbnail / Icon area */}
          <div className="relative aspect-[4/3] w-full bg-secondary/50 flex items-center justify-center overflow-hidden">
            <FileThumbnail
              path={file.file_path}
              mimeType={file.mime_type}
              name={file.file_name}
              className="transition-transform group-hover:scale-105"
              iconSize="lg"
            />
            {/* Actions overlay */}
            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity" onClick={(e) => e.stopPropagation()}>
              <FileActions file={file} onPreview={onPreview} />
            </div>
          </div>
          {/* File info */}
          <div className="flex flex-col gap-1 p-3">
            <h3 className="text-sm font-medium text-card-foreground truncate leading-tight" title={file.file_name}>
              {file.file_name}
            </h3>
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">
                {formatFileSize(file.file_size)}
              </span>
              <span className="text-xs text-muted-foreground">
                {new Date(file.upload_date).toLocaleDateString()}
              </span>
              {file.is_shared && (
                <Badge variant="secondary" className="ml-auto gap-1 text-[10px] px-1.5 py-0">
                  <Share2 className="h-2.5 w-2.5" />
                </Badge>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

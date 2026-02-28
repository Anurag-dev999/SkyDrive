'use client'

import type { FileItem } from '@/lib/types'
import { formatFileSize } from '@/lib/file-helpers'
import { FileActions } from './file-actions'
import { Badge } from '@/components/ui/badge'
import { Share2 } from 'lucide-react'
import { FileThumbnail } from './file-thumbnail'

interface FileListProps {
  files: FileItem[]
  onPreview: (file: FileItem) => void
}

export function FileList({ files, onPreview }: FileListProps) {
  return (
    <div className="overflow-x-auto rounded-xl border border-border bg-card">
      <table className="w-full">
        <thead>
          <tr className="border-b border-border">
            <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Name
            </th>
            <th className="hidden sm:table-cell px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Size
            </th>
            <th className="hidden md:table-cell px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Modified
            </th>
            <th className="hidden md:table-cell px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Status
            </th>
            <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">
              <span className="sr-only">Actions</span>
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {files.map((file) => (
            <tr
              key={file.id}
              className="group transition-colors hover:bg-secondary/30 cursor-pointer"
              onClick={() => onPreview(file)}
              draggable={false}
              onDragStart={(e) => e.preventDefault()}
            >
              <td className="px-4 py-3">
                <div className="flex items-center gap-3">
                  <FileThumbnail
                    path={file.file_path}
                    mimeType={file.mime_type}
                    name={file.file_name}
                    className="h-8 w-8 shrink-0 rounded-md"
                    iconSize="sm"
                  />
                  <span className="text-sm font-medium text-card-foreground truncate max-w-[200px] sm:max-w-[300px]">
                    {file.file_name}
                  </span>
                </div>
              </td>
              <td className="hidden sm:table-cell px-4 py-3 text-sm text-muted-foreground">
                {formatFileSize(file.file_size)}
              </td>
              <td className="hidden md:table-cell px-4 py-3 text-sm text-muted-foreground">
                {new Date(file.upload_date).toLocaleDateString()}
              </td>
              <td className="hidden md:table-cell px-4 py-3">
                {file.is_shared ? (
                  <Badge variant="secondary" className="gap-1 text-xs">
                    <Share2 className="h-3 w-3" />
                    Shared
                  </Badge>
                ) : (
                  <span className="text-xs text-muted-foreground">Private</span>
                )}
              </td>
              <td className="px-4 py-3 text-right" onClick={(e) => e.stopPropagation()}>
                <FileActions file={file} onPreview={onPreview} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

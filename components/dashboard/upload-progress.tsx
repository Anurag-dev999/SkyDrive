'use client'

import { useApp } from '@/context/app-context'
import { Progress } from '@/components/ui/progress'
import { formatFileSize } from '@/lib/file-helpers'
import { Upload, CheckCircle2 } from 'lucide-react'

export function UploadProgress() {
  const { uploadingFiles } = useApp()

  if (uploadingFiles.length === 0) return null

  return (
    <div className="fixed bottom-4 right-4 z-50 w-80 rounded-xl border border-border bg-card shadow-lg">
      <div className="flex items-center gap-2 border-b border-border px-4 py-3">
        <Upload className="h-4 w-4 text-primary" />
        <span className="text-sm font-medium text-card-foreground">
          Uploading {uploadingFiles.length} file{uploadingFiles.length > 1 ? 's' : ''}
        </span>
      </div>
      <div className="max-h-48 overflow-y-auto p-2">
        {uploadingFiles.map((file) => (
          <div key={file.id} className="flex flex-col gap-1.5 px-2 py-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-card-foreground truncate max-w-[180px]">
                {file.name}
              </span>
              <div className="flex items-center gap-1">
                {file.progress >= 100 ? (
                  <CheckCircle2 className="h-3.5 w-3.5 text-accent" />
                ) : (
                  <span className="text-xs text-muted-foreground">{Math.round(file.progress)}%</span>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Progress value={file.progress} className="h-1.5 flex-1" />
              <span className="text-[10px] text-muted-foreground">{formatFileSize(file.size)}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

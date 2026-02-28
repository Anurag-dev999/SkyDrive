'use client'

import { useMemo, useState, useCallback } from 'react'
import { useApp } from '@/context/app-context'
import type { FileItem } from '@/lib/types'
import { getFileCategory } from '@/lib/file-helpers'
import { FileToolbar } from './file-toolbar'
import { FileGrid } from './file-grid'
import { FileList } from './file-list'
import { FilePreview } from './file-preview'
import { Upload } from 'lucide-react'
import { ProfilePage } from './profile-page'

export function FileArea() {
  const { files, viewMode, sortBy, sortOrder, searchQuery, activeSection, uploadFiles } = useApp()
  const [previewFile, setPreviewFile] = useState<FileItem | null>(null)

  const handleDropOnEmpty = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      e.stopPropagation()
      if (e.dataTransfer.files && e.dataTransfer.files.length > 0 && e.dataTransfer.types.includes('Files')) {
        uploadFiles(e.dataTransfer.files)
      }
    },
    [uploadFiles]
  )

  const filteredFiles = useMemo(() => {
    let result = [...files]

    // Trash section shows only trashed files
    if (activeSection === 'trash') {
      return result
        .filter((f) => f.is_trashed)
        .sort((a, b) => {
          const dateA = a.trashed_date ? new Date(a.trashed_date).getTime() : 0
          const dateB = b.trashed_date ? new Date(b.trashed_date).getTime() : 0
          return dateB - dateA
        })
    }

    // All other sections exclude trashed files
    result = result.filter((f) => !f.is_trashed)

    // Filter by section
    if (activeSection === 'shared') {
      result = result.filter((f) => f.is_shared)
    } else if (activeSection === 'recent') {
      const weekAgo = Date.now() - 86400000 * 7
      result = result.filter((f) => new Date(f.upload_date).getTime() > weekAgo)
    } else if (activeSection === 'images' || activeSection === 'documents' || activeSection === 'videos' || activeSection === 'others') {
      result = result.filter((f) => getFileCategory(f.mime_type) === activeSection)
    }

    // Filter by search
    if (searchQuery) {
      const q = searchQuery.toLowerCase()
      result = result.filter((f) => f.file_name.toLowerCase().includes(q))
    }

    // Sort
    result.sort((a, b) => {
      let cmp = 0
      switch (sortBy) {
        case 'name':
          cmp = a.file_name.localeCompare(b.file_name)
          break
        case 'date':
          cmp = new Date(a.upload_date).getTime() - new Date(b.upload_date).getTime()
          break
        case 'size':
          cmp = a.file_size - b.file_size
          break
      }
      return sortOrder === 'asc' ? cmp : -cmp
    })

    return result
  }, [files, sortBy, sortOrder, searchQuery, activeSection])

  const isTrashEmpty = activeSection === 'trash' && filteredFiles.length === 0
  const isFilesEmpty = activeSection !== 'trash' && filteredFiles.length === 0

  return (
    <div className="flex flex-col gap-6 p-4 lg:p-6">
      <FileToolbar fileCount={filteredFiles.length} />

      {activeSection === 'profile' ? (
        <ProfilePage />
      ) : isTrashEmpty ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="flex items-center justify-center rounded-2xl bg-secondary p-6 mb-4">
            <svg className="h-12 w-12 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-1">Trash is empty</h3>
          <p className="text-sm text-muted-foreground max-w-sm">
            Items you delete will appear here for recovery.
          </p>
        </div>
      ) : isFilesEmpty ? (
        <div
          className="flex items-center justify-center min-h-[50vh]"
          onDrop={handleDropOnEmpty}
          onDragOver={(e) => e.preventDefault()}
        >
          <div
            className="group flex w-full max-w-lg flex-col items-center justify-center rounded-2xl border-2 border-dashed border-border bg-secondary/30 px-8 py-14 text-center transition-all duration-200 hover:border-primary/50 hover:bg-primary/[0.06] hover:shadow-sm cursor-pointer"
            onClick={() => {
              const input = document.createElement('input')
              input.type = 'file'
              input.multiple = true
              input.onchange = (e) => {
                const target = e.target as HTMLInputElement
                if (target.files && target.files.length > 0) {
                  uploadFiles(target.files)
                }
              }
              input.click()
            }}
          >
            <div className="flex items-center justify-center rounded-xl bg-primary/10 p-4 mb-4 transition-transform duration-200 group-hover:scale-110">
              <Upload className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-base font-semibold text-foreground mb-1">Drop files here</h3>
            <p className="text-sm text-muted-foreground max-w-xs">
              {searchQuery
                ? 'No files match your search. Try different keywords.'
                : 'Drag and drop files here, or click to browse.'}
            </p>
          </div>
        </div>
      ) : viewMode === 'grid' ? (
        <FileGrid files={filteredFiles} onPreview={setPreviewFile} />
      ) : (
        <FileList files={filteredFiles} onPreview={setPreviewFile} />
      )}

      <FilePreview
        file={previewFile}
        open={previewFile !== null}
        onClose={() => setPreviewFile(null)}
      />
    </div>
  )
}

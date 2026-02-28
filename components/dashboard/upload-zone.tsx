'use client'

import { useState, useCallback } from 'react'
import { useApp } from '@/context/app-context'
import { cn } from '@/lib/utils'
import { Upload } from 'lucide-react'

export function UploadZone({ children }: { children: React.ReactNode }) {
  const { uploadFiles } = useApp()
  const [isDragging, setIsDragging] = useState(false)
  const [dragCounter, setDragCounter] = useState(0)

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    // Only respond if there are actual files being dragged
    if (e.dataTransfer.types.includes('Files')) {
      setDragCounter((prev) => prev + 1)
      setIsDragging(true)
    }
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragCounter((prev) => {
      const newCounter = prev - 1
      if (newCounter === 0) {
        setIsDragging(false)
      }
      return newCounter
    })
  }, [])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }, [])

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      e.stopPropagation()
      setIsDragging(false)
      setDragCounter(0)
      
      // Only upload if it's an external file drop
      if (e.dataTransfer.files && e.dataTransfer.files.length > 0 && e.dataTransfer.types.includes('Files')) {
        uploadFiles(e.dataTransfer.files)
      }
    },
    [uploadFiles]
  )

  return (
    <div
      className="relative flex-1 overflow-hidden"
      onDragEnter={handleDragEnter}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {children}
      {isDragging && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-primary/10 backdrop-blur-sm border-2 border-dashed border-primary rounded-xl m-2">
          <div className="flex flex-col items-center gap-3 text-primary">
            <Upload className="h-12 w-12" />
            <p className="text-lg font-semibold">Drop files to upload</p>
          </div>
        </div>
      )}
    </div>
  )
}

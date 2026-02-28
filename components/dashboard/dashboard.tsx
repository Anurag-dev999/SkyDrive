'use client'

import { useState, useRef } from 'react'
import { useApp } from '@/context/app-context'
import { DashboardHeader } from './dashboard-header'
import { DashboardSidebar } from './dashboard-sidebar'
import { FileArea } from './file-area'
import { UploadZone } from './upload-zone'
import { UploadProgress } from './upload-progress'
import { Plus } from 'lucide-react'

export function Dashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { uploadFiles } = useApp()
  const fabInputRef = useRef<HTMLInputElement>(null)

  const handleFabClick = () => {
    fabInputRef.current?.click()
  }

  const handleFabFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      uploadFiles(e.target.files)
      e.target.value = ''
    }
  }

  return (
    <div className="flex h-screen flex-col bg-background overflow-hidden">
      <DashboardHeader onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
      <div className="flex flex-1 overflow-hidden">
        <DashboardSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <UploadZone>
          <div className="flex-1 overflow-y-auto">
            <FileArea />
          </div>
        </UploadZone>
      </div>
      <UploadProgress />

      {/* Floating Action Button */}
      <input
        ref={fabInputRef}
        type="file"
        multiple
        className="hidden"
        onChange={handleFabFiles}
      />
      <button
        onClick={handleFabClick}
        className="fixed bottom-6 right-6 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg transition-all hover:scale-105 hover:shadow-xl active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        aria-label="Upload files"
      >
        <Plus className="h-6 w-6" />
      </button>
    </div>
  )
}

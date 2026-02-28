'use client'

import { useState } from 'react'
import { useApp } from '@/context/app-context'
import { Button } from '@/components/ui/button'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { LayoutGrid, List, ArrowUpDown, Trash2 } from 'lucide-react'
import type { SortBy } from '@/lib/types'

const sectionLabels: Record<string, string> = {
  'my-files': 'My Files',
  shared: 'Shared Files',
  recent: 'Recent Uploads',
  images: 'Images',
  documents: 'Documents',
  videos: 'Videos',
  others: 'Others',
  trash: 'Trash',
}

interface FileToolbarProps {
  fileCount: number
}

export function FileToolbar({ fileCount }: FileToolbarProps) {
  const { viewMode, setViewMode, sortBy, setSortBy, sortOrder, setSortOrder, activeSection, emptyTrash, files } = useApp()
  const [showEmptyConfirm, setShowEmptyConfirm] = useState(false)

  const trashedCount = files.filter((f) => f.is_trashed).length

  return (
    <>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground">{sectionLabels[activeSection]}</h1>
          <p className="text-sm text-muted-foreground">
            {fileCount} {fileCount === 1 ? 'file' : 'files'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {activeSection === 'trash' && trashedCount > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowEmptyConfirm(true)}
              className="gap-2 text-destructive border-destructive/30 hover:bg-destructive/10"
            >
              <Trash2 className="h-3.5 w-3.5" />
              Empty trash
            </Button>
          )}
          <Select value={sortBy} onValueChange={(v) => setSortBy(v as SortBy)}>
            <SelectTrigger className="w-32 bg-background text-foreground">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="name">Name</SelectItem>
              <SelectItem value="date">Date</SelectItem>
              <SelectItem value="size">Size</SelectItem>
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
            className="text-foreground"
            aria-label="Toggle sort order"
          >
            <ArrowUpDown className="h-4 w-4" />
          </Button>
          <div className="flex items-center rounded-lg border border-border bg-background">
            <Button
              variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
              size="icon"
              className="h-8 w-8 rounded-r-none"
              onClick={() => setViewMode('grid')}
              aria-label="Grid view"
            >
              <LayoutGrid className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'secondary' : 'ghost'}
              size="icon"
              className="h-8 w-8 rounded-l-none"
              onClick={() => setViewMode('list')}
              aria-label="List view"
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      <AlertDialog open={showEmptyConfirm} onOpenChange={setShowEmptyConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Empty trash?</AlertDialogTitle>
            <AlertDialogDescription>
              {trashedCount} {trashedCount === 1 ? 'file' : 'files'} will be permanently deleted. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={async () => {
                await emptyTrash()
                setShowEmptyConfirm(false)
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete permanently
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

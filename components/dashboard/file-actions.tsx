'use client'

import { useState } from 'react'
import { useApp } from '@/context/app-context'
import type { FileItem } from '@/lib/types'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  MoreHorizontal,
  Download,
  Pencil,
  Trash2,
  Share2,
  Copy,
  Link2,
  Eye,
  RotateCcw,
  X,
} from 'lucide-react'
import { toast } from 'sonner'

interface FileActionsProps {
  file: FileItem
  onPreview: (file: FileItem) => void
}

export function FileActions({ file, onPreview }: FileActionsProps) {
  const { trashFile, restoreFile, permanentDeleteFile, renameFile, toggleShare, activeSection } = useApp()
  const [renameOpen, setRenameOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [shareOpen, setShareOpen] = useState(false)
  const [newName, setNewName] = useState(file.file_name)

  const isTrash = activeSection === 'trash'
  const fallbackShareUrl =
    typeof window !== 'undefined'
      ? `${window.location.origin}/share/${file.id}`
      : `/share/${file.id}`
  const shareUrl = file.share_url || fallbackShareUrl

  const handleRename = () => {
    if (newName.trim() && newName !== file.file_name) {
      renameFile(file.id, newName.trim())
      toast.success('File renamed')
    }
    setRenameOpen(false)
  }

  const handleTrash = async () => {
    await trashFile(file.id)
    toast.success('Moved to trash', {
      action: {
        label: 'Undo',
        onClick: () => restoreFile(file.id),
      },
    })
  }

  const handleRestore = async () => {
    await restoreFile(file.id)
    toast.success('File restored')
  }

  const handlePermanentDelete = async () => {
    await permanentDeleteFile(file.id)
    toast.success('File permanently deleted')
    setDeleteOpen(false)
  }

  const handleDownload = async () => {
    try {
      const { data, error } = await supabase.storage.from('files').download(file.file_path)
      if (error) throw error

      const url = URL.createObjectURL(data)
      const a = document.createElement('a')
      a.href = url
      a.download = file.file_name
      a.click()
      URL.revokeObjectURL(url)
      toast.success('Download started')
    } catch (err: any) {
      toast.error('Failed to download file')
      console.error(err)
    }
  }

  const handleShare = () => {
    if (!file.is_shared) {
      toggleShare(file.id)
    }
    setShareOpen(true)
  }

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl)
    toast.success('Link copied to clipboard')
  }

  // Trash-specific dropdown
  if (isTrash) {
    return (
      <>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
              <MoreHorizontal className="h-4 w-4" />
              <span className="sr-only">File actions</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem onClick={handleRestore}>
              <RotateCcw className="mr-2 h-4 w-4" />
              Restore
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => setDeleteOpen(true)} variant="destructive">
              <X className="mr-2 h-4 w-4" />
              Delete permanently
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="text-foreground">Delete permanently</DialogTitle>
              <DialogDescription>
                Are you sure you want to permanently delete &quot;{file.file_name}&quot;? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDeleteOpen(false)}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={handlePermanentDelete}>
                Delete forever
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </>
    )
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
            <MoreHorizontal className="h-4 w-4" />
            <span className="sr-only">File actions</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuItem onClick={() => onPreview(file)}>
            <Eye className="mr-2 h-4 w-4" />
            Preview
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleDownload}>
            <Download className="mr-2 h-4 w-4" />
            Download
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => { setNewName(file.file_name); setRenameOpen(true) }}>
            <Pencil className="mr-2 h-4 w-4" />
            Rename
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleShare}>
            <Share2 className="mr-2 h-4 w-4" />
            {file.is_shared ? 'Manage sharing' : 'Share'}
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleTrash} variant="destructive">
            <Trash2 className="mr-2 h-4 w-4" />
            Move to trash
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Rename Dialog */}
      <Dialog open={renameOpen} onOpenChange={setRenameOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-foreground">Rename file</DialogTitle>
            <DialogDescription>Enter a new name for this file.</DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-2 py-2">
            <Label htmlFor="new-name" className="text-foreground">File name</Label>
            <Input
              id="new-name"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleRename()}
              className="bg-background"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRenameOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleRename}>Rename</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Share Dialog */}
      <Dialog open={shareOpen} onOpenChange={setShareOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-foreground">Share file</DialogTitle>
            <DialogDescription>
              Anyone with the link can view this file.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-3 py-2">
            <div className="flex items-center gap-2">
              <Link2 className="h-4 w-4 text-muted-foreground shrink-0" />
              <Input
                readOnly
                value={shareUrl}
                className="bg-secondary text-foreground font-mono text-xs"
              />
              <Button size="sm" variant="outline" onClick={handleCopyLink}>
                <Copy className="h-4 w-4" />
              </Button>
            </div>
            {file.is_shared && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  toggleShare(file.id)
                  setShareOpen(false)
                  toast.success('Sharing disabled')
                }}
                className="w-fit"
              >
                Disable sharing
              </Button>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}

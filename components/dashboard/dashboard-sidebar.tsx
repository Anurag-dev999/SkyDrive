'use client'

import { useApp } from '@/context/app-context'
import { Progress } from '@/components/ui/progress'
import { formatFileSize } from '@/lib/file-helpers'
import type { SidebarSection } from '@/lib/types'
import { cn } from '@/lib/utils'
import { Files, Share2, Clock, HardDrive, ImageIcon, FileText, Film, Package, Trash2, User } from 'lucide-react'

interface DashboardSidebarProps {
  open: boolean
  onClose: () => void
}

const mainNav: { id: SidebarSection; label: string; icon: React.ElementType }[] = [
  { id: 'my-files', label: 'My Files', icon: Files },
  { id: 'shared', label: 'Shared Files', icon: Share2 },
  { id: 'recent', label: 'Recent Uploads', icon: Clock },
]

const categoryNav: { id: SidebarSection; label: string; icon: React.ElementType }[] = [
  { id: 'images', label: 'Images', icon: ImageIcon },
  { id: 'documents', label: 'Documents', icon: FileText },
  { id: 'videos', label: 'Videos', icon: Film },
  { id: 'others', label: 'Others', icon: Package },
  { id: 'profile', label: 'Profile', icon: User },
]

export function DashboardSidebar({ open, onClose }: DashboardSidebarProps) {
  const { activeSection, setActiveSection, usedStorage, totalStorage, files } = useApp()

  const storagePercent = Math.round((usedStorage / totalStorage) * 100)
  const trashedCount = files.filter((f) => f.is_trashed).length

  const handleNavClick = (section: SidebarSection) => {
    setActiveSection(section)
    onClose()
  }

  function NavItem({ item }: { item: { id: SidebarSection; label: string; icon: React.ElementType } }) {
    const Icon = item.icon
    const isActive = activeSection === item.id
    return (
      <li>
        <button
          onClick={() => handleNavClick(item.id)}
          className={cn(
            'flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
            isActive
              ? 'bg-sidebar-accent text-sidebar-accent-foreground'
              : 'text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground'
          )}
        >
          <Icon className="h-4 w-4" />
          {item.label}
        </button>
      </li>
    )
  }

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 z-40 bg-foreground/20 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-sidebar-border bg-sidebar transition-transform duration-300 lg:static lg:z-auto lg:translate-x-0',
          open ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex h-16 items-center gap-2 border-b border-sidebar-border px-4 lg:hidden">
          <span className="text-lg font-bold text-sidebar-foreground">SkyDrive</span>
          <img src="/logo.svg" alt="SkyDrive Logo" className="h-7 w-7 object-contain" />
        </div>

        <nav className="flex-1 overflow-y-auto p-4">
          <p className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Browse
          </p>
          <ul className="flex flex-col gap-0.5">
            {mainNav.map((item) => (
              <NavItem key={item.id} item={item} />
            ))}
          </ul>

          <p className="mt-6 mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Categories
          </p>
          <ul className="flex flex-col gap-0.5">
            {categoryNav.map((item) => (
              <NavItem key={item.id} item={item} />
            ))}
          </ul>

          <div className="mt-6">
            <ul className="flex flex-col gap-0.5">
              <li>
                <button
                  onClick={() => handleNavClick('trash')}
                  className={cn(
                    'flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                    activeSection === 'trash'
                      ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                      : 'text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground'
                  )}
                >
                  <Trash2 className="h-4 w-4" />
                  Trash
                  {trashedCount > 0 && (
                    <span className="ml-auto flex h-5 w-5 items-center justify-center rounded-full bg-destructive/15 text-[10px] font-semibold text-destructive">
                      {trashedCount}
                    </span>
                  )}
                </button>
              </li>
            </ul>
          </div>
        </nav>

        <div className="border-t border-sidebar-border p-4">
          <div className="flex items-center gap-2 mb-3">
            <HardDrive className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium text-sidebar-foreground">Storage</span>
          </div>
          <Progress value={storagePercent} className="mb-2 h-2" />
          <p className="text-xs text-muted-foreground">
            {formatFileSize(usedStorage)} of {formatFileSize(totalStorage)} used
          </p>
        </div>
      </aside>
    </>
  )
}

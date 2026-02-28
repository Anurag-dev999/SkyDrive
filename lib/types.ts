export interface FileItem {
  id: string
  user_id: string
  file_name: string
  file_path: string
  file_size: number
  mime_type: string
  upload_date: string
  is_shared: boolean
  share_url?: string
  is_trashed: boolean
  trashed_date?: string
  thumbnail_url?: string
}

export interface User {
  id: string
  email: string
  name: string
  avatar?: string
}

export type ViewMode = 'grid' | 'list'
export type SortBy = 'name' | 'date' | 'size'
export type SortOrder = 'asc' | 'desc'
export type FileCategory = 'images' | 'documents' | 'videos' | 'others'
export type SidebarSection = 'my-files' | 'shared' | 'recent' | 'images' | 'documents' | 'videos' | 'others' | 'trash' | 'profile'

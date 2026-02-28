'use client'

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react'
import type { Session } from '@supabase/supabase-js'
import type { FileItem, User, ViewMode, SortBy, SortOrder, SidebarSection } from '@/lib/types'
import { generateId } from '@/lib/file-helpers'
import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'

interface UploadingFile {
  id: string
  name: string
  progress: number
  size: number
}

interface AppContextType {
  user: User | null
  files: FileItem[]
  viewMode: ViewMode
  sortBy: SortBy
  sortOrder: SortOrder
  searchQuery: string
  activeSection: SidebarSection
  uploadingFiles: UploadingFile[]
  login: (email: string, password: string) => Promise<boolean>
  signup: (name: string, email: string, password: string) => Promise<boolean>
  logout: () => void
  uploadFiles: (fileList: FileList) => Promise<void>
  trashFile: (id: string) => Promise<void>
  restoreFile: (id: string) => Promise<void>
  permanentDeleteFile: (id: string) => Promise<void>
  emptyTrash: () => Promise<void>
  renameFile: (id: string, newName: string) => Promise<void>
  toggleShare: (id: string) => Promise<void>
  refreshFiles: () => Promise<void>
  setViewMode: (mode: ViewMode) => void
  setSortBy: (sort: SortBy) => void
  setSortOrder: (order: SortOrder) => void
  setSearchQuery: (query: string) => void
  setActiveSection: (section: SidebarSection) => void
  getSignedUrl: (path: string) => Promise<string | null>
  totalStorage: number
  usedStorage: number
  loading: boolean
  syncing: boolean
}

const AppContext = createContext<AppContextType | undefined>(undefined)
const RESUMABLE_UPLOAD_THRESHOLD_BYTES = 20 * 1024 * 1024
const STANDARD_UPLOAD_TIMEOUT_MS = 120000

function buildSafeStoragePath(userId: string, originalName: string): string {
  const parts = originalName.split('.')
  const ext = parts.length > 1 ? `.${parts[parts.length - 1].toLowerCase()}` : ''
  const unique = `${Date.now()}_${crypto.randomUUID()}`
  return `${userId}/${unique}${ext}`
}

function getProjectRefFromUrl(url: string): string | null {
  try {
    const hostname = new URL(url).hostname
    const [projectRef] = hostname.split('.')
    return projectRef || null
  } catch {
    return null
  }
}

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [files, setFiles] = useState<FileItem[]>([])
  const [viewMode, setViewMode] = useState<ViewMode>('grid')
  const [sortBy, setSortBy] = useState<SortBy>('date')
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc')
  const [searchQuery, setSearchQuery] = useState('')
  const [activeSection, setActiveSection] = useState<SidebarSection>('my-files')
  const [uploadingFiles, setUploadingFiles] = useState<UploadingFile[]>([])
  const [loading, setLoading] = useState(true)
  const [syncing, setSyncing] = useState(false)

  const totalStorage = 5 * 1024 * 1024 * 1024 // 5GB (Premium Allocation)
  const usedStorage = files.filter((f) => !f.is_trashed).reduce((acc, f) => acc + f.file_size, 0)

  // Fetch files from Supabase (manual sync only)
  const fetchFiles = useCallback(async (userId: string): Promise<boolean> => {
    const { data, error } = await supabase
      .from('files')
      .select('*')
      .eq('user_id', userId)
      .order('upload_date', { ascending: false })

    if (error) {
      console.error('Error fetching files:', error)
      toast.error('Failed to load files')
      return false
    }

    setFiles(data as FileItem[])
    return true
  }, [])

  // Auth state listener
  useEffect(() => {
    let mounted = true
    const loadingFallback = setTimeout(() => {
      if (mounted) {
        setLoading(false)
      }
    }, 1500)

    const applySession = async (session: Session | null) => {
      if (!mounted) return

      if (session?.user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single()

        setUser({
          id: session.user.id,
          email: session.user.email!,
          name: profile?.name || session.user.email?.split('@')[0] || 'User',
          avatar: profile?.avatar_url,
        })
      } else {
        setUser(null)
        setFiles([])
      }
    }

    const initAuth = async () => {
      try {
        const { data, error } = await supabase.auth.getSession()
        if (error) {
          console.error('Error getting session:', error)
          setUser(null)
          setFiles([])
          return
        }
        await applySession(data.session)
      } finally {
        if (mounted) setLoading(false)
      }
    }

    initAuth()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      await applySession(session)
      if (mounted) setLoading(false)
    })

    return () => {
      mounted = false
      clearTimeout(loadingFallback)
      subscription.unsubscribe()
    }
  }, [])

  const login = useCallback(async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) {
        // this can also be a CORS issue or network failure returning a message
        toast.error(error.message)
        return false
      }
      return true
    } catch (err) {
      // supabase-js sometimes throws a TypeError on network failures (e.g. CORS, offline)
      console.error('login error', err)
      toast.error(
        err instanceof Error
          ? `Network error: ${err.message}`
          : 'An unknown network error occurred',
      )
      return false
    }
  }, [])

  const signup = useCallback(async (name: string, email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { name },
        },
      })
      if (error) {
        toast.error(error.message)
        return false
      }
      toast.success('Check your email for the confirmation link!')
      return true
    } catch (err) {
      console.error('signup error', err)
      toast.error(
        err instanceof Error
          ? `Network error: ${err.message}`
          : 'An unknown network error occurred',
      )
      return false
    }
  }, [])

  const logout = useCallback(async () => {
    await supabase.auth.signOut()
    setUser(null)
    setFiles([])
    setSearchQuery('')
    setActiveSection('my-files')
    setLoading(false)
  }, [supabase])

  /**
   * Orchestrates the multi-step upload process:
   * 1. Generates a unique path in Supabase Storage.
   * 2. Uploads the binary file data.
   * 3. Records the file metadata in the database.
   * 4. Updates the local UI state for immediate feedback.
   */
  const uploadFiles = useCallback(
    async (fileList: FileList | File[]) => {
      if (!user) return

      const fileArray = Array.from(fileList)
      const newUploads: UploadingFile[] = fileArray.map((f) => ({
        id: generateId(),
        name: f.name,
        progress: 0,
        size: f.size,
      }))

      setUploadingFiles((prev) => [...prev, ...newUploads])

      const setUploadProgress = (uploadId: string, progress: number) => {
        setUploadingFiles((prev) =>
          prev.map((u) => (u.id === uploadId ? { ...u, progress: Math.min(100, Math.max(0, progress)) } : u))
        )
      }

      const uploadStandardWithTimeout = async (file: File, filePath: string, uploadInfo: UploadingFile) => {
        let progress = 10
        const progressTimer = setInterval(() => {
          progress = Math.min(progress + 5, 85)
          setUploadProgress(uploadInfo.id, progress)
        }, 1200)

        try {
          const uploadPromise = supabase.storage
            .from('files')
            .upload(filePath, file, {
              upsert: false,
              contentType: file.type || 'application/octet-stream',
            })

          const timeoutPromise = new Promise<never>((_, reject) => {
            setTimeout(() => reject(new Error('Upload timed out. Please try again.')), STANDARD_UPLOAD_TIMEOUT_MS)
          })

          const result = await Promise.race([uploadPromise, timeoutPromise])
          return result
        } finally {
          clearInterval(progressTimer)
        }
      }

      const uploadResumable = async (file: File, filePath: string, uploadInfo: UploadingFile) => {
        const { Upload } = await import('tus-js-client')
        const { data: sessionData } = await supabase.auth.getSession()
        const accessToken = sessionData.session?.access_token
        if (!accessToken) {
          throw new Error('No active auth session for resumable upload')
        }
        const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
        if (!anonKey) {
          throw new Error('Missing Supabase anon key for resumable upload')
        }

        const projectRef = getProjectRefFromUrl(process.env.NEXT_PUBLIC_SUPABASE_URL || '')
        if (!projectRef) {
          throw new Error('Invalid Supabase project URL')
        }

        const endpoint = `https://${projectRef}.storage.supabase.co/storage/v1/upload/resumable`

        await new Promise<void>((resolve, reject) => {
          const upload = new Upload(file, {
            endpoint,
            chunkSize: 6 * 1024 * 1024,
            uploadDataDuringCreation: true,
            removeFingerprintOnSuccess: true,
            retryDelays: [0, 3000, 5000, 10000, 20000],
            headers: {
              authorization: `Bearer ${accessToken}`,
              apikey: anonKey,
              'x-upsert': 'false',
            },
            metadata: {
              bucketName: 'files',
              objectName: filePath,
              contentType: file.type || 'application/octet-stream',
              cacheControl: '3600',
            },
            onError: (error) => reject(error),
            onProgress: (bytesUploaded, bytesTotal) => {
              const percent = Math.round((bytesUploaded / bytesTotal) * 100)
              setUploadProgress(uploadInfo.id, percent)
            },
            onSuccess: () => resolve(),
          })

          upload.findPreviousUploads().then((previousUploads) => {
            if (previousUploads.length > 0) {
              upload.resumeFromPreviousUpload(previousUploads[0])
            }
            upload.start()
          }).catch(reject)
        })
      }

      // Function to handle a single file upload
      const uploadSingleFile = async (file: File, uploadInfo: UploadingFile) => {
        const filePath = buildSafeStoragePath(user.id, file.name)

        try {
          // 1. Storage upload (standard for average files, resumable for large files)
          setUploadProgress(uploadInfo.id, 10)
          if (file.size > RESUMABLE_UPLOAD_THRESHOLD_BYTES) {
            await uploadResumable(file, filePath, uploadInfo)
          } else {
            const { error: storageError } = await uploadStandardWithTimeout(file, filePath, uploadInfo)
            if (storageError) throw storageError
            setUploadProgress(uploadInfo.id, 70)
          }

          // 2. Database Insert
          // We can pre-calculate the public URL for the record even if it's private,
          // but we'll use signed URLs for the actual preview.
          const { data: publicUrlData } = supabase.storage.from('files').getPublicUrl(filePath)
          const thumbnailUrl = file.type.startsWith('image/') ? publicUrlData.publicUrl : undefined

          const { data: fileData, error: dbError } = await supabase
            .from('files')
            .insert({
              user_id: user.id,
              file_name: file.name,
              file_path: filePath,
              file_size: file.size,
              mime_type: file.type || 'application/octet-stream',
              thumbnail_url: thumbnailUrl,
            })
            .select()
            .single()

          if (dbError) throw dbError

          // 3. Update UI state (Immediate)
          setFiles((prev) => [fileData as FileItem, ...prev])
          setUploadProgress(uploadInfo.id, 100)

          // Small delay before removing from progress bar for UX
          setTimeout(() => {
            setUploadingFiles((prev) => prev.filter((u) => u.id !== uploadInfo.id))
          }, 500)

        } catch (error: any) {
          console.error(`Upload failed for ${file.name}:`, error)
          toast.error(error?.message ? `Failed to upload ${file.name}: ${error.message}` : `Failed to upload ${file.name}`)
          setUploadingFiles((prev) => prev.filter((u) => u.id !== uploadInfo.id))
        }
      }

      // Execute all uploads in parallel
      await Promise.all(fileArray.map((file, index) => uploadSingleFile(file, newUploads[index])))
    },
    [user, supabase]
  )

  /**
   * Soft-deletes a file by marking it as trashed.
   * This is a reversible operation managed via the `is_trashed` flag.
   */
  const trashFile = useCallback(async (id: string) => {
    console.log('Trashing file:', id)
    const now = new Date().toISOString()
    const { error } = await supabase
      .from('files')
      .update({ is_trashed: true, trashed_date: now })
      .eq('id', id)

    if (error) {
      console.error('Trash error:', error)
      toast.error('Failed to move to trash')
    } else {
      setFiles((prev) =>
        prev.map((f) => (f.id === id ? { ...f, is_trashed: true, trashed_date: now } : f))
      )
      console.log('File trashed successfully')
    }
  }, [])

  const restoreFile = useCallback(async (id: string) => {
    console.log('Restoring file:', id)
    const { error } = await supabase
      .from('files')
      .update({ is_trashed: false, trashed_date: null })
      .eq('id', id)

    if (error) {
      console.error('Restore error:', error)
      toast.error('Failed to restore file')
    } else {
      setFiles((prev) =>
        prev.map((f) => (f.id === id ? { ...f, is_trashed: false, trashed_date: undefined } : f))
      )
      console.log('File restored successfully')
    }
  }, [])

  /**
   * Permanently deletes a file from both the storage bucket and the database.
   * This operation is irreversible and ensures all data is scrubbed.
   */
  const permanentDeleteFile = useCallback(async (id: string) => {
    console.log('Permanently deleting file:', id)
    const fileToDelete = files.find(f => f.id === id)
    if (!fileToDelete) return

    // 1. Delete from Storage
    // Ensure we are using the exact path returned from metadata
    const { error: storageError } = await supabase.storage.from('files').remove([fileToDelete.file_path])
    if (storageError) {
      console.warn('Storage deletion warning:', storageError)
    }

    // 2. Delete from DB
    const { error: dbError } = await supabase.from('files').delete().eq('id', id)

    if (dbError) {
      console.error('Permanent delete error:', dbError)
      toast.error('Failed to delete metadata')
    } else {
      setFiles((prev) => prev.filter((f) => f.id !== id))
      console.log('File permanently deleted from DB and State')
    }
  }, [files])

  const getSignedUrl = useCallback(async (path: string) => {
    const { data, error } = await supabase.storage.from('files').createSignedUrl(path, 3600) // 1 hour
    if (error) {
      console.error('Error creating signed URL:', error)
      return null
    }
    return data.signedUrl
  }, [])

  const emptyTrash = useCallback(async () => {
    const trashedFiles = files.filter(f => f.is_trashed)
    const trashedPaths = trashedFiles.map(f => f.file_path)
    console.log('Emptying trash. Files to delete:', trashedFiles.length)

    if (trashedPaths.length > 0) {
      const { error: storageError } = await supabase.storage.from('files').remove(trashedPaths)
      if (storageError) console.warn('Storage emptyTrash warning:', storageError)
    }

    const { error: dbError } = await supabase.from('files').delete().eq('is_trashed', true)

    if (dbError) {
      console.error('Empty trash error:', dbError)
      toast.error('Failed to empty trash')
    } else {
      setFiles((prev) => prev.filter((f) => !f.is_trashed))
      toast.success(`Cleared ${trashedFiles.length} items from trash`)
      console.log('Trash emptied successfully')
    }
  }, [files])

  const renameFile = useCallback(async (id: string, newName: string) => {
    const { error } = await supabase.from('files').update({ file_name: newName }).eq('id', id)

    if (error) toast.error('Failed to rename file')
    else {
      setFiles((prev) => prev.map((f) => (f.id === id ? { ...f, file_name: newName } : f)))
    }
  }, [])

  const toggleShare = useCallback(async (id: string) => {
    const file = files.find(f => f.id === id)
    if (!file) return

    const newIsShared = !file.is_shared
    const shareUrl = newIsShared ? `${window.location.origin}/share/${id}` : null

    console.log('Toggling share for:', id, 'New status:', newIsShared)

    const { error } = await supabase
      .from('files')
      .update({ is_shared: newIsShared, share_url: shareUrl })
      .eq('id', id)

    if (error) {
      console.error('Toggle share error:', error)
      toast.error('Failed to update share status')
    } else {
      setFiles((prev) =>
        prev.map((f) =>
          f.id === id ? { ...f, is_shared: newIsShared, share_url: shareUrl || undefined } : f
        )
      )
      toast.success(newIsShared ? 'Sharing enabled' : 'Sharing disabled')
      console.log('Share status updated successfully')
    }
  }, [files])

  const refreshFiles = useCallback(async () => {
    if (!user) {
      setFiles([])
      return
    }

    setSyncing(true)
    try {
      const ok = await fetchFiles(user.id)
      if (ok) {
        toast.success('Synced with SkyDrive')
      }
    } finally {
      setSyncing(false)
    }
  }, [user, fetchFiles])

  const contextValue = React.useMemo(() => ({
    user,
    files,
    viewMode,
    sortBy,
    sortOrder,
    searchQuery,
    activeSection,
    uploadingFiles,
    login,
    signup,
    logout,
    uploadFiles,
    trashFile,
    restoreFile,
    permanentDeleteFile,
    emptyTrash,
    renameFile,
    toggleShare,
    refreshFiles,
    setViewMode,
    setSortBy,
    setSortOrder,
    setSearchQuery,
    setActiveSection,
    getSignedUrl,
    totalStorage,
    usedStorage,
    loading,
    syncing,
  }), [
    user, files, viewMode, sortBy, sortOrder, searchQuery, activeSection,
    uploadingFiles, login, signup, logout, uploadFiles, trashFile,
    restoreFile, permanentDeleteFile, emptyTrash, renameFile, toggleShare,
    refreshFiles, getSignedUrl, totalStorage, usedStorage, loading, syncing
  ])

  return (
    <AppContext.Provider value={contextValue}>
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  const context = useContext(AppContext)
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider')
  }
  return context
}

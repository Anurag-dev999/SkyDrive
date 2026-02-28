'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { formatFileSize, getFileIcon } from '@/lib/file-helpers'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Download, Link2 } from 'lucide-react'

interface SharedFile {
  id: string
  file_name: string
  file_path: string
  file_size: number
  mime_type: string
  upload_date: string
  is_shared: boolean
  is_trashed: boolean
}

/**
 * Builds the public object URL for a file in the "files" bucket.
 * Anonymous storage SELECT policy allows direct download for shared files.
 */
function getStorageObjectUrl(filePath: string): string {
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL
  if (!base) return '#'
  // Supabase public object URL pattern:
  // https://<ref>.supabase.co/storage/v1/object/public/<bucket>/<path>
  // But since the bucket is PRIVATE, anonymous access is granted via the RLS
  // policy we created. We use the authenticated endpoint which respects RLS:
  // https://<ref>.supabase.co/storage/v1/object/authenticated/<bucket>/<path>
  // However for anon, the correct pattern is just the render endpoint:
  return `${base}/storage/v1/object/sign/files/${encodeURIComponent(filePath)}`
}

export default function SharedFilePage() {
  const params = useParams<{ id: string }>()
  const shareId = useMemo(() => (params?.id || '').trim(), [params])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [file, setFile] = useState<SharedFile | null>(null)
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true

    async function loadSharedFile() {
      if (!shareId) {
        if (!mounted) return
        setLoading(false)
        setError('Invalid share link.')
        return
      }

      setLoading(true)
      setError(null)

      // 1. Fetch shared file metadata (works for anon via "Anon can read shared file metadata" policy)
      const { data, error: fileError } = await supabase
        .from('files')
        .select('id, file_name, file_path, file_size, mime_type, upload_date, is_shared, is_trashed')
        .eq('id', shareId)
        .eq('is_shared', true)
        .eq('is_trashed', false)
        .maybeSingle()

      if (fileError || !data) {
        if (!mounted) return
        setFile(null)
        setDownloadUrl(null)
        setError('Shared file not found or no longer available.')
        setLoading(false)
        return
      }

      // 2. Build the download URL.
      // The anonymous storage policy "Anon can download shared storage objects"
      // allows anon to SELECT the object, so we can use the Supabase download endpoint.
      // We use the REST API endpoint which respects RLS policies for the anon key.
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
      const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
      if (supabaseUrl && supabaseKey) {
        // Use the /object/authenticated endpoint with the anon key as apikey param.
        // This endpoint respects storage RLS, so our anon policy allows the download.
        const objectUrl = `${supabaseUrl}/storage/v1/object/authenticated/files/${data.file_path}`
        if (!mounted) return
        setDownloadUrl(objectUrl)
      } else {
        if (!mounted) return
        setDownloadUrl(null)
        setError('Unable to generate download link. Please try again later.')
      }

      if (!mounted) return
      setFile(data as SharedFile)
      setLoading(false)
    }

    loadSharedFile()

    return () => {
      mounted = false
    }
  }, [shareId])

  // Trigger a download by fetching with the anon key header
  const handleDownload = async () => {
    if (!file) return

    try {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
      const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
      if (!supabaseUrl || !supabaseKey) return

      // Download via Supabase storage REST API with anon apikey
      const res = await fetch(
        `${supabaseUrl}/storage/v1/object/authenticated/files/${file.file_path}`,
        {
          headers: {
            apikey: supabaseKey,
            Authorization: `Bearer ${supabaseKey}`,
          },
        }
      )

      if (!res.ok) {
        setError('Download failed. The file may no longer be shared.')
        return
      }

      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = file.file_name
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch (err) {
      console.error('Download error:', err)
      setError('Download failed. Please try again.')
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-background text-foreground px-4 py-10">
        <div className="mx-auto max-w-3xl rounded-xl border bg-card p-6">
          <p className="text-sm text-muted-foreground">Loading shared file...</p>
        </div>
      </main>
    )
  }

  if (error || !file) {
    return (
      <main className="min-h-screen bg-background text-foreground px-4 py-10">
        <div className="mx-auto max-w-3xl rounded-xl border bg-card p-6 space-y-4">
          <h1 className="text-xl font-semibold">Shared File</h1>
          <p className="text-sm text-muted-foreground">{error || 'File not found.'}</p>
          <Button asChild variant="outline">
            <Link href="/">Go to SkyDrive</Link>
          </Button>
        </div>
      </main>
    )
  }

  const isImage = file.mime_type.startsWith('image/')
  const previewUrl = downloadUrl
    ? `${downloadUrl}?${new URLSearchParams({ apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '' }).toString()}`
    : null

  const uploadDate = new Date(file.upload_date).toLocaleString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })

  return (
    <main className="min-h-screen bg-background text-foreground px-4 py-10">
      <div className="mx-auto max-w-3xl rounded-xl border bg-card p-6 space-y-6">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <h1 className="truncate text-xl font-semibold">{file.file_name}</h1>
            <p className="text-sm text-muted-foreground">Shared from SkyDrive</p>
          </div>
          <Badge variant="secondary">
            <Link2 className="mr-1 h-3 w-3" />
            Public Link
          </Badge>
        </div>

        <div className="rounded-lg border bg-secondary/30 p-4">
          {isImage && previewUrl ? (
            <img
              src={previewUrl}
              alt={file.file_name}
              className="mx-auto max-h-[480px] w-full object-contain"
              crossOrigin="anonymous"
            />
          ) : (
            <div className="flex min-h-44 items-center justify-center">
              <p className="text-sm text-muted-foreground capitalize">
                {getFileIcon(file.mime_type)} file preview unavailable
              </p>
            </div>
          )}
        </div>

        <div className="grid gap-2 text-sm">
          <p><span className="text-muted-foreground">Type:</span> {file.mime_type}</p>
          <p><span className="text-muted-foreground">Size:</span> {formatFileSize(file.file_size)}</p>
          <p><span className="text-muted-foreground">Uploaded:</span> {uploadDate}</p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button onClick={handleDownload} disabled={!downloadUrl}>
            <Download className="mr-2 h-4 w-4" />
            Download
          </Button>
          <Button asChild variant="outline">
            <Link href="/">Open SkyDrive</Link>
          </Button>
        </div>
      </div>
    </main>
  )
}

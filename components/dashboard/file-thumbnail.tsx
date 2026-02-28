'use client'

import { useState, useEffect } from 'react'
import { useApp } from '@/context/app-context'
import { FileIcon } from './file-icon'
import { cn } from '@/lib/utils'

interface FileThumbnailProps {
    path: string
    mimeType: string
    name: string
    className?: string
    iconSize?: 'sm' | 'md' | 'lg'
}

export function FileThumbnail({ path, mimeType, name, className, iconSize = 'md' }: FileThumbnailProps) {
    const { getSignedUrl } = useApp()
    const [url, setUrl] = useState<string | null>(null)
    const isImage = mimeType.startsWith('image/')

    useEffect(() => {
        if (isImage) {
            getSignedUrl(path).then(setUrl)
        }
    }, [path, isImage, getSignedUrl])

    if (isImage && url) {
        return (
            <img
                src={url}
                alt={name}
                className={cn("h-full w-full object-cover", className)}
                crossOrigin="anonymous"
                draggable={false}
            />
        )
    }

    return (
        <div className={cn("flex items-center justify-center bg-secondary/30", className)}>
            <FileIcon mimeType={mimeType} size={iconSize} />
        </div>
    )
}

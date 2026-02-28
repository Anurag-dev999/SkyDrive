'use client'

import { useApp } from '@/context/app-context'
import { formatFileSize } from '@/lib/file-helpers'
import { Progress } from '@/components/ui/progress'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { HardDrive, Mail, User, ShieldCheck } from 'lucide-react'

export function ProfilePage() {
    const { user, usedStorage, totalStorage } = useApp()

    const storagePercent = Math.min(100, Math.round((usedStorage / totalStorage) * 100))
    const remainingStorage = totalStorage - usedStorage
    const limitGB = Math.round(totalStorage / (1024 * 1024 * 1024))

    const initials = user?.name
        ? user.name
            .split(' ')
            .map((n) => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2)
        : 'U'

    return (
        <div className="flex flex-col gap-6 max-w-4xl mx-auto">
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold text-foreground">Account Profile</h1>
                <p className="text-muted-foreground">Manage your account settings and monitor your storage usage.</p>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
                {/* Profile Card */}
                <Card className="md:col-span-2 border-border/50 shadow-sm">
                    <CardHeader className="pb-4">
                        <CardTitle className="text-xl">Personal Information</CardTitle>
                        <CardDescription>Details about your SkyDrive account.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="flex items-center gap-4">
                            <Avatar className="h-16 w-16 border-2 border-primary/20">
                                <AvatarImage src={user?.avatar} />
                                <AvatarFallback className="bg-primary text-primary-foreground text-xl font-bold">
                                    {initials}
                                </AvatarFallback>
                            </Avatar>
                            <div className="flex flex-col">
                                <span className="text-lg font-semibold text-foreground">{user?.name}</span>
                                <span className="text-sm text-muted-foreground">Authenticated via Supabase</span>
                            </div>
                        </div>

                        <div className="grid gap-4 pt-2">
                            <div className="flex items-center gap-3 p-3 rounded-lg bg-secondary/30">
                                <Mail className="h-4 w-4 text-muted-foreground" />
                                <div className="flex flex-col">
                                    <span className="text-xs text-muted-foreground uppercase font-semibold">Email Address</span>
                                    <span className="text-sm font-medium text-foreground">{user?.email}</span>
                                </div>
                            </div>

                            <div className="flex items-center gap-3 p-3 rounded-lg bg-secondary/30">
                                <User className="h-4 w-4 text-muted-foreground" />
                                <div className="flex flex-col">
                                    <span className="text-xs text-muted-foreground uppercase font-semibold">User ID</span>
                                    <span className="text-sm font-mono text-foreground break-all">{user?.id}</span>
                                </div>
                            </div>

                            <div className="flex items-center gap-3 p-3 rounded-lg bg-secondary/30 border border-emerald-500/20">
                                <ShieldCheck className="h-4 w-4 text-emerald-500" />
                                <div className="flex flex-col">
                                    <span className="text-xs text-muted-foreground uppercase font-semibold">Protection</span>
                                    <span className="text-sm font-medium text-foreground">Row-Level Security (RLS) Active</span>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Storage Card */}
                <Card className="border-border/50 shadow-sm overflow-hidden">
                    <div className="h-2 bg-primary" style={{ width: `${storagePercent}%` }} />
                    <CardHeader className="pb-4">
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-xl">Storage Plan</CardTitle>
                            <HardDrive className="h-5 w-5 text-primary" />
                        </div>
                        <CardDescription>{limitGB}GB Cloud Storage Free</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                                <span className="font-medium text-foreground">{formatFileSize(usedStorage)} used</span>
                                <span className="text-muted-foreground">{storagePercent}%</span>
                            </div>
                            <Progress value={storagePercent} className="h-2.5 rounded-full" />
                            <p className="text-xs text-muted-foreground text-center pt-1">
                                {formatFileSize(remainingStorage)} available of {formatFileSize(totalStorage)}
                            </p>
                        </div>

                        <div className="rounded-xl border border-border bg-card p-3 space-y-2">
                            <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Usage Status</h4>
                            <div className="flex items-center gap-2">
                                <div className={`h-2 w-2 rounded-full ${storagePercent > 90 ? 'bg-destructive' : 'bg-emerald-500'}`} />
                                <span className="text-sm font-medium text-foreground">
                                    {storagePercent > 90 ? 'Storage almost full' : 'Healthy Storage'}
                                </span>
                            </div>
                        </div>

                        <p className="text-[10px] text-muted-foreground italic leading-relaxed">
                            * SkyDrive provides every user with {limitGB}GB of encrypted, high-performance vault storage powered by Supabase.
                        </p>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}

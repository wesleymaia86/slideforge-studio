'use client'

import { useState, useCallback, useRef } from 'react'
import { useParams } from 'next/navigation'
import { Upload, File, X, CheckCircle, AlertCircle, FileVideo, FileText, FileImage, Loader2 } from 'lucide-react'
import { TopBar } from '@/components/layout/TopBar'
import { useUploads } from '@/lib/api/hooks'

interface FileItem {
  id: string
  file: File
  status: 'pending' | 'uploading' | 'done' | 'error'
  progress: number
  error?: string
}

function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function FileIcon({ mimeType }: { mimeType: string }) {
  if (mimeType.startsWith('video/')) return <FileVideo className="w-5 h-5 text-info" />
  if (mimeType.startsWith('image/')) return <FileImage className="w-5 h-5 text-success" />
  if (mimeType.includes('pdf') || mimeType.includes('presentation') || mimeType.includes('powerpoint')) {
    return <FileText className="w-5 h-5 text-accent" />
  }
  return <File className="w-5 h-5 text-text-faint" />
}

export default function UploadPage() {
  const { id } = useParams<{ id: string }>()
  const { data: uploads } = useUploads(id)
  const [files, setFiles] = useState<FileItem[]>([])
  const [dragging, setDragging] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const addFiles = useCallback((incoming: File[]) => {
    const newItems: FileItem[] = incoming.map((f) => ({
      id: Math.random().toString(36).slice(2),
      file: f,
      status: 'pending',
      progress: 0,
    }))
    setFiles((prev) => [...prev, ...newItems])
    // Simulate upload for demo
    newItems.forEach((item) => simulateUpload(item.id))
  }, [])

  const simulateUpload = (fileId: string) => {
    setFiles((prev) => prev.map((f) => f.id === fileId ? { ...f, status: 'uploading' } : f))
    let progress = 0
    const interval = setInterval(() => {
      progress += Math.random() * 20 + 5
      if (progress >= 100) {
        clearInterval(interval)
        setFiles((prev) => prev.map((f) => f.id === fileId ? { ...f, status: 'done', progress: 100 } : f))
      } else {
        setFiles((prev) => prev.map((f) => f.id === fileId ? { ...f, progress: Math.min(progress, 95) } : f))
      }
    }, 300)
  }

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragging(false)
    const dropped = Array.from(e.dataTransfer.files)
    if (dropped.length > 0) addFiles(dropped)
  }, [addFiles])

  const removeFile = (id: string) => setFiles((prev) => prev.filter((f) => f.id !== id))

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <TopBar />
      <div className="flex-1 overflow-y-auto px-6 py-6">
        <div className="mb-6">
          <h1 className="font-display text-2xl text-text mb-1">Upload Center</h1>
          <p className="text-text-muted text-sm">Add slides, documents, videos, or audio recordings to your project.</p>
        </div>

        {/* Drop zone */}
        <div
          onDragEnter={() => setDragging(true)}
          onDragLeave={() => setDragging(false)}
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
          className={`relative rounded-2xl border-2 border-dashed transition-all cursor-pointer p-12 text-center mb-6 ${
            dragging
              ? 'border-accent bg-accent/5'
              : 'border-border hover:border-border-strong hover:bg-surface-2'
          }`}
        >
          <input
            ref={inputRef}
            type="file"
            multiple
            accept=".pptx,.ppt,.pdf,.mp4,.mov,.mp3,.wav,.jpg,.jpeg,.png"
            className="hidden"
            onChange={(e) => {
              if (e.target.files) addFiles(Array.from(e.target.files))
            }}
          />
          <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 transition-colors ${dragging ? 'bg-accent/15 text-accent' : 'bg-surface-2 text-text-faint'}`}>
            <Upload className="w-7 h-7" />
          </div>
          <p className={`font-medium text-sm mb-1 transition-colors ${dragging ? 'text-accent' : 'text-text'}`}>
            {dragging ? 'Drop files here' : 'Drop files or click to browse'}
          </p>
          <p className="text-xs text-text-muted">
            PPTX, PDF, MP4, MOV, MP3, WAV, JPG, PNG — up to 500 MB per file
          </p>
        </div>

        {/* File list */}
        {files.length > 0 && (
          <div className="space-y-2 mb-6">
            <h2 className="text-sm font-semibold text-text mb-3">Uploading</h2>
            {files.map((item) => (
              <div key={item.id} className="flex items-center gap-4 px-4 py-3 bg-surface rounded-xl border border-border">
                <FileIcon mimeType={item.file.type} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-text truncate">{item.file.name}</p>
                  <p className="text-xs text-text-muted">{formatSize(item.file.size)}</p>
                  {item.status === 'uploading' && (
                    <div className="mt-1.5 w-full bg-surface-3 rounded-full h-1">
                      <div
                        className="h-full rounded-full bg-accent transition-all duration-300"
                        style={{ width: `${item.progress}%` }}
                      />
                    </div>
                  )}
                </div>
                <div className="shrink-0">
                  {item.status === 'pending' && <div className="w-2 h-2 rounded-full bg-text-faint" />}
                  {item.status === 'uploading' && <Loader2 className="w-4 h-4 text-accent animate-spin" />}
                  {item.status === 'done' && <CheckCircle className="w-4 h-4 text-success" />}
                  {item.status === 'error' && <AlertCircle className="w-4 h-4 text-error" />}
                </div>
                {(item.status === 'done' || item.status === 'error') && (
                  <button onClick={() => removeFile(item.id)} className="text-text-faint hover:text-text transition-colors">
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Uploaded files */}
        {(uploads?.length ?? 0) > 0 && (
          <div>
            <h2 className="text-sm font-semibold text-text mb-3">Project Files</h2>
            <div className="space-y-2">
              {uploads!.map((upload) => (
                <div key={upload.id} className="flex items-center gap-4 px-4 py-3 bg-surface rounded-xl border border-border">
                  <FileIcon mimeType={upload.mimeType} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-text truncate">{upload.filename}</p>
                    <p className="text-xs text-text-muted">{formatSize(upload.size)}</p>
                  </div>
                  <CheckCircle className="w-4 h-4 text-success shrink-0" />
                </div>
              ))}
            </div>
          </div>
        )}

        {files.length === 0 && !uploads?.length && (
          <div className="text-center py-8 text-text-faint text-sm">
            No files uploaded yet. Drop some files above to get started.
          </div>
        )}
      </div>
    </div>
  )
}

'use client'

import { useState, useCallback } from 'react'
import { importTargets } from '@/lib/api/targets'
import { useApiClient } from '@/hooks/useApiClient'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Upload, FileText, Trash2, Loader2, AlertCircle } from 'lucide-react'
import { toast } from 'sonner'
import { ScrapeProgressDialog } from './scrape-progress-dialog'

interface ImportDomainsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

export function ImportDomainsDialog({
  open,
  onOpenChange,
  onSuccess,
}: ImportDomainsDialogProps) {
  const apiClient = useApiClient()
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [taskId, setTaskId] = useState<string | null>(null)
  const [showProgress, setShowProgress] = useState(false)

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const selectedFile = e.target.files?.[0]
      if (selectedFile) {
        // Validate file type
        if (!selectedFile.name.endsWith('.csv') && !selectedFile.name.endsWith('.xlsx')) {
          toast.error('Please upload a CSV or Excel file')
          return
        }
        setFile(selectedFile)
      }
    },
    []
  )

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()

    const droppedFile = e.dataTransfer.files?.[0]
    if (droppedFile) {
      if (!droppedFile.name.endsWith('.csv') && !droppedFile.name.endsWith('.xlsx')) {
        toast.error('Please upload a CSV or Excel file')
        return
      }
      setFile(droppedFile)
    }
  }, [])

  const handleImport = async () => {
    if (!file) {
      toast.error('Please select a file to import')
      return
    }

    setUploading(true)
    try {
      const response = await importTargets(
        {
          baseUrl: apiClient.baseUrl,
          apiKey: apiClient.apiKey,
        },
        file
      )

      setTaskId(response.task_id)
      setShowProgress(true)
      toast.success(`Started importing ${response.domains_count} domains`)
    } catch (err) {
      toast.error((err as Error).message || 'Failed to start import')
    } finally {
      setUploading(false)
    }
  }

  const handleProgressComplete = () => {
    setShowProgress(false)
    setTaskId(null)
    setFile(null)
    onOpenChange(false)

    if (onSuccess) {
      onSuccess()
    }
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Import Domains</DialogTitle>
            <DialogDescription>
              Upload a CSV or Excel file with domains to scrape for leads
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Dropzone */}
            <div
              onDrop={handleDrop}
              onDragOver={(e) => {
                e.preventDefault()
                e.stopPropagation()
              }}
              className="relative border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-lg p-8 text-center hover:border-indigo-400 transition-colors cursor-pointer"
            >
              <input
                type="file"
                accept=".csv,.xlsx"
                onChange={handleFileChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />

              {file ? (
                <div className="flex flex-col items-center gap-2">
                  <FileText className="w-8 h-8 text-indigo-600" />
                  <p className="font-medium text-sm text-slate-900 dark:text-white">
                    {file.name}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {(file.size / 1024).toFixed(2)} KB
                  </p>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-2">
                  <Upload className="w-8 h-8 text-slate-400" />
                  <p className="font-medium text-sm text-slate-900 dark:text-white">
                    Drag and drop your file
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    or click to browse (CSV or Excel)
                  </p>
                </div>
              )}
            </div>

            {/* File requirements */}
            <div className="rounded-lg bg-slate-50 dark:bg-slate-900 p-3 border border-slate-200 dark:border-slate-800">
              <div className="flex gap-2 text-xs">
                <AlertCircle className="w-4 h-4 text-slate-500 flex-shrink-0 mt-0.5" />
                <div className="space-y-1 text-slate-600 dark:text-slate-400">
                  <p><strong>File format:</strong> CSV or Excel with domain column</p>
                  <p><strong>Headers required:</strong> domain, or first column will be treated as domains</p>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2 justify-end">
              <Button
                variant="outline"
                onClick={() => {
                  setFile(null)
                  onOpenChange(false)
                }}
                disabled={uploading}
              >
                Cancel
              </Button>
              {file && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setFile(null)}
                  disabled={uploading}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              )}
              <Button
                onClick={handleImport}
                disabled={!file || uploading}
              >
                {uploading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  'Import Domains'
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <ScrapeProgressDialog
        taskId={taskId}
        open={showProgress}
        onOpenChange={setShowProgress}
        onComplete={handleProgressComplete}
      />
    </>
  )
}

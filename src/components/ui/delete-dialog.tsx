"use client"

import { Trash2, Loader2, X } from "lucide-react"
import { Button } from "@/components/ui/button"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

interface DeleteConfirmDialogProps {
  open: boolean
  title?: string
  description?: string
  itemName?: string
  loading?: boolean
  onConfirm: () => void
  onCancel: () => void
}

export function DeleteConfirmDialog({
  open,
  title = "Delete document",
  description = "This will permanently remove",
  itemName,
  loading = false,
  onConfirm,
  onCancel,
}: DeleteConfirmDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={(v) => !v && !loading && onCancel()}>
      <AlertDialogContent
        className={[
          // Center in viewport instead of pinning to a corner
          "fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2",
          "w-[calc(100%-2rem)] max-w-sm",
          // Match the app's glass-card language
          "rounded-3xl border border-white/10 bg-[#0a0f1a]/95 p-6",
          "shadow-2xl shadow-black/50 backdrop-blur-xl",
        ].join(" ")}
      >
        <button
          onClick={() => !loading && onCancel()}
          disabled={loading}
          className="absolute right-4 top-4 rounded-lg p-1 text-muted-foreground transition-colors hover:bg-white/10 hover:text-white disabled:pointer-events-none"
          aria-label="Close"
        >
          <X className="h-4 w-4" />
        </button>

        <AlertDialogHeader className="items-start gap-0 text-left">
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-red-500/10 ring-1 ring-red-500/20">
            <Trash2 className="h-5 w-5 text-red-400" />
          </div>

          <AlertDialogTitle className="mt-4 text-base font-semibold text-white">
            {title}
          </AlertDialogTitle>

          <AlertDialogDescription className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
            {description}{" "}
            {itemName ? (
              <span className="font-medium text-white">"{itemName}"</span>
            ) : null}
            . This can't be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter className="mt-6 flex-row justify-end gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={loading}
            onClick={() => !loading && onCancel()}
            className="mt-0"
          >
            Cancel
          </Button>

          <Button
            variant="destructive"
            size="sm"
            disabled={loading}
            onClick={() => {
              if (loading) return
              onConfirm()
            }}
            className="mt-0"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                Deleting
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <Trash2 className="h-4 w-4" />
                Delete
              </span>
            )}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
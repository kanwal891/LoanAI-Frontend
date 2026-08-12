"use client"

import { Trash2, Loader2 } from "lucide-react"

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
  title = "Delete Document",
  description = "Are you sure you want to delete",
  itemName,
  loading = false,
  onConfirm,
  onCancel,
}: DeleteConfirmDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={(v) => !v && !loading && onCancel()}>
      <AlertDialogContent className="fixed bottom-4 right-4 max-w-[22rem] border-red-500/20 bg-[#0B1220] text-white shadow-2xl">
        <AlertDialogHeader className="grid gap-4 text-left">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-500/10">
            <Trash2 className="h-6 w-6 text-red-400" />
          </div>

          <AlertDialogTitle className="text-base font-semibold text-white">
            {title}
          </AlertDialogTitle>

          <AlertDialogDescription className="mt-2 text-sm text-gray-300">
            {description}
          </AlertDialogDescription>
          {itemName ? (
            <p className="mt-2 text-sm font-semibold text-white">"{itemName}"</p>
          ) : null}
          <p className="mt-3 text-xs text-red-400">
            This action cannot be undone.
          </p>
        </AlertDialogHeader>

        <AlertDialogFooter className="mt-4 flex items-center justify-end gap-2">
          <AlertDialogCancel
            disabled={loading}
            onClick={(e) => {
              // Radix auto-closes on click already for Cancel, which is fine —
              // but guard it so it can't fire mid-delete either.
              if (loading) e.preventDefault()
            }}
            className="border border-white/10 bg-white/5 px-3 py-2 text-sm text-white hover:bg-white/10"
          >
            Cancel
          </AlertDialogCancel>

          <AlertDialogAction
            disabled={loading}
            onClick={(e) => {
              // AlertDialogAction closes the dialog by default on click.
              // Prevent that so the dialog stays open (showing the loading
              // state) until the parent's onConfirm finishes and explicitly
              // closes it by flipping `open` to false.
              e.preventDefault()
              onConfirm()
            }}
            className="bg-red-600 px-3 py-2 text-sm text-white hover:bg-red-700 focus:ring-red-500"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Deleting...
              </>
            ) : (
              <>
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </>
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
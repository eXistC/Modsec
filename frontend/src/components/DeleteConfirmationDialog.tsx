import React from 'react';
import { AlertTriangle, Trash2 } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface DeleteConfirmationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  itemType?: string;
  itemName?: string;
}

export function DeleteConfirmationDialog({
  isOpen,
  onClose,
  onConfirm,
  itemType = "item",
  itemName
}: DeleteConfirmationDialogProps) {
  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent className="max-w-[400px]">
        <AlertDialogHeader>
          <div className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="h-5 w-5" />
            <AlertDialogTitle>Delete {itemType}</AlertDialogTitle>
          </div>
          <AlertDialogDescription className="pt-2">
            {itemName ? (
              <>Are you sure you want to delete <span className="font-medium text-foreground">"{itemName}"</span>?</>
            ) : (
              <>Are you sure you want to delete this {itemType}?</>
            )}
            <div className="mt-4 rounded-md bg-destructive/10 p-3 text-sm text-destructive">
              <div className="flex items-start gap-2">
                <Trash2 className="h-5 w-5 flex-shrink-0 translate-y-0.5" />
                <span>
                  This action cannot be undone. This will permanently delete
                  the {itemType} from your account.
                </span>
              </div>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel className="w-full sm:w-auto">Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            className="bg-destructive hover:bg-destructive/90 w-full sm:w-auto"
          >
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
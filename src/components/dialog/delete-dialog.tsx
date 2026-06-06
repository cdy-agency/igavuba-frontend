'use client';

import { ConfirmDialog } from './ConfirmDialog';

export interface DeleteDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  description?: string;
  itemName?: string;
  confirmText?: string;
  onConfirm: () => void | Promise<void>;
  onCancel?: () => void;
}

export function DeleteDialog({
  isOpen,
  onOpenChange,
  title = 'Delete item',
  description,
  itemName,
  confirmText = 'Delete',
  onConfirm,
  onCancel,
}: DeleteDialogProps) {
  const resolvedDescription =
    description ??
    (itemName
      ? `Are you sure you want to delete "${itemName}"? This action cannot be undone.`
      : 'Are you sure you want to delete this item? This action cannot be undone.');

  return (
    <ConfirmDialog
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      title={title}
      description={resolvedDescription}
      confirmText={confirmText}
      cancelText="Cancel"
      variant="destructive"
      onConfirm={onConfirm}
      onCancel={onCancel}
    />
  );
}

export default DeleteDialog;

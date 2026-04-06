import { useState, useCallback } from "react";

interface ConfirmationDialogState {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm?: () => void;
  onCancel?: () => void;
}

export function useConfirmationDialog() {
  const [dialogState, setDialogState] = useState<ConfirmationDialogState>({
    isOpen: false,
    title: "",
    message: "",
    confirmText: "Xác nhận",
    cancelText: "Hủy",
  });

  const openDialog = useCallback(
    (
      title: string,
      message: string,
      onConfirm: () => void,
      onCancel?: () => void,
      confirmText?: string,
      cancelText?: string
    ) => {
      setDialogState({
        isOpen: true,
        title,
        message,
        onConfirm,
        onCancel,
        confirmText: confirmText || "Xác nhận",
        cancelText: cancelText || "Hủy",
      });
    },
    []
  );

  const closeDialog = useCallback(() => {
    setDialogState((prev) => ({ ...prev, isOpen: false }));
  }, []);

  const handleConfirm = useCallback(() => {
    if (dialogState.onConfirm) {
      dialogState.onConfirm();
    }
    closeDialog();
  }, [dialogState.onConfirm, closeDialog]);

  const handleCancel = useCallback(() => {
    if (dialogState.onCancel) {
      dialogState.onCancel();
    }
    closeDialog();
  }, [dialogState.onCancel, closeDialog]);

  return {
    dialogState,
    openDialog,
    closeDialog,
    handleConfirm,
    handleCancel,
  };
}

import { toast as sonnerToast, ExternalToast } from "sonner";

export interface ToastProps {
  title?: string;
  description?: string | React.ReactNode;
  variant?: "default" | "destructive" | "success" | "warning" | "info";
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
  onDismiss?: () => void;
}

export const useToast = () => {
  const toast = ({
    title,
    description,
    variant = "default",
    duration,
    action,
    onDismiss,
  }: ToastProps) => {
    const options: ExternalToast = {
      description,
      duration,
      onDismiss,
      action: action
        ? {
            label: action.label,
            onClick: action.onClick,
          }
        : undefined,
    };

    switch (variant) {
      case "success":
        return sonnerToast.success(title || "Thành công", options);
      case "destructive":
        return sonnerToast.error(title || "Lỗi", options);
      case "warning":
        return sonnerToast.warning(title || "Cảnh báo", options);
      case "info":
        return sonnerToast.info(title || "Thông báo", options);
      default:
        return sonnerToast(title || "Thông báo", options);
    }
  };

  return { toast };
};

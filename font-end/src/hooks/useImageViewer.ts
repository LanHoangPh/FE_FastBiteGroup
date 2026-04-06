import { useState } from "react";

interface ImageAttachment {
  fileId: number;
  fileName: string;
  storageUrl: string;
  fileType: string;
  fileSize: number;
}

interface MessageInfo {
  senderName: string;
  sentAt: string;
  content?: string;
}

interface UseImageViewerReturn {
  isOpen: boolean;
  images: ImageAttachment[];
  initialIndex: number;
  messageInfo: MessageInfo | undefined;
  openImageViewer: (
    images: ImageAttachment[],
    initialIndex?: number,
    messageInfo?: MessageInfo
  ) => void;
  closeImageViewer: () => void;
}

export function useImageViewer(): UseImageViewerReturn {
  const [isOpen, setIsOpen] = useState(false);
  const [images, setImages] = useState<ImageAttachment[]>([]);
  const [initialIndex, setInitialIndex] = useState(0);
  const [messageInfo, setMessageInfo] = useState<MessageInfo | undefined>();

  const openImageViewer = (
    newImages: ImageAttachment[],
    newInitialIndex = 0,
    newMessageInfo?: MessageInfo
  ) => {
    setImages(newImages);
    setInitialIndex(newInitialIndex);
    setMessageInfo(newMessageInfo);
    setIsOpen(true);
  };

  const closeImageViewer = () => {
    setIsOpen(false);
    // Clear data after animation completes
    setTimeout(() => {
      setImages([]);
      setInitialIndex(0);
      setMessageInfo(undefined);
    }, 300);
  };

  return {
    isOpen,
    images,
    initialIndex,
    messageInfo,
    openImageViewer,
    closeImageViewer,
  };
}

import { useState } from "react";
import { toast } from "sonner";
import { UploadingFile, FileUploadResponseDto } from "@/types/customer/file";
import { uploadMultipleFiles } from "@/lib/api/customer/files";

export function useFileUploader() {
  const [uploadingFiles, setUploadingFiles] = useState<UploadingFile[]>([]);

  const uploadFiles = async (files: File[]) => {
    // Frontend validation
    if (files.length > 5) {
      toast.error("Chỉ được phép tải lên tối đa 5 file.");
      return;
    }

    const totalSize = files.reduce((sum, file) => sum + file.size, 0);
    const maxSize = 50 * 1024 * 1024; // 50MB

    if (totalSize > maxSize) {
      toast.error("Tổng dung lượng không được vượt quá 50MB.");
      return;
    }

    // Create uploading file objects
    const newUploadingFiles: UploadingFile[] = files.map((file) => {
      const abortController = new AbortController();
      return {
        localId: `file-${Date.now()}-${Math.random()
          .toString(36)
          .substr(2, 9)}`,
        file,
        status: "pending",
        progress: 0,
        abortController,
      };
    });

    // Update state with pending files
    setUploadingFiles((prev) => [...prev, ...newUploadingFiles]);

    // Upload files (without progress tracking for now)
    await Promise.all(
      newUploadingFiles.map(async (uploadingFile) => {
        try {
          // Update status to uploading
          setUploadingFiles((prev) =>
            prev.map((uf) =>
              uf.localId === uploadingFile.localId
                ? { ...uf, status: "uploading", progress: 50 } // Set to 50% as a placeholder
                : uf
            )
          );

          // Perform the actual upload
          const uploadedFiles = await uploadMultipleFiles({
            files: [uploadingFile.file],
            context: "ChatMessage",
          });

          // Update status to success
          setUploadingFiles((prev) =>
            prev.map((uf) =>
              uf.localId === uploadingFile.localId
                ? {
                    ...uf,
                    status: "success",
                    result: uploadedFiles[0],
                    progress: 100,
                  }
                : uf
            )
          );
        } catch (error: any) {
          // Update status to error
          setUploadingFiles((prev) =>
            prev.map((uf) =>
              uf.localId === uploadingFile.localId
                ? {
                    ...uf,
                    status: "error",
                    error: error.message || "Upload failed",
                  }
                : uf
            )
          );
        }
      })
    );
  };

  const removeFile = (localId: string) => {
    setUploadingFiles((prev) =>
      prev.filter((file) => file.localId !== localId)
    );
  };

  const cancelUpload = (localId: string) => {
    setUploadingFiles((prev) => {
      const file = prev.find((f) => f.localId === localId);
      if (file && file.status === "uploading") {
        file.abortController.abort();
      }
      return prev.filter((f) => f.localId !== localId);
    });
  };

  const clearAllFiles = () => {
    setUploadingFiles([]);
  };

  return {
    uploadingFiles,
    uploadFiles,
    removeFile,
    cancelUpload,
    clearAllFiles,
  };
}

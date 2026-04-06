import apiClient from "@/lib/api/apiClient";
import { ApiResponse } from "@/types/api.types";
import {
  FileUploadResponseDto,
  UploadMultipleFilesDto,
} from "@/types/customer/file";

/**
 * Uploads multiple files to the server
 * @param files - Array of files to upload
 * @param context - Upload context (e.g., 'ChatMessage')
 * @returns Promise<FileUploadResponseDto[]> - Array of uploaded file information
 */
export async function uploadMultipleFiles({
  files,
  context,
}: UploadMultipleFilesDto): Promise<FileUploadResponseDto[]> {
  try {
    const formData = new FormData();

    // Append each file to the FormData
    files.forEach((file) => {
      formData.append("files", file);
    });

    // Append the context
    formData.append("context", context);

    const response = await apiClient.post("/files/upload-multiple", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    const apiResponse = response.data as ApiResponse<FileUploadResponseDto[]>;
    return apiResponse.data;
  } catch (error) {
    console.error("Error uploading files:", error);
    throw error;
  }
}

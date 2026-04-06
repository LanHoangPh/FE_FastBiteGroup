// src/types/file.ts

/**
 * @description The successful response payload for each file uploaded.
 * @response_from POST /api/v1/files/upload-multiple
 */
export interface FileUploadResponseDto {
  fileId: number;
  fileName: string;
  url: string; // The URL to preview the file
}

/**
 * @description The request payload for uploading multiple files.
 * @used_in POST /api/v1/files/upload-multiple
 */
export interface UploadMultipleFilesDto {
  files: File[];
  context: string;
}

/**
 * @description Represents the client-side state of a file during the upload process.
 */
export interface UploadingFile {
  /** A unique temporary ID generated on the client to use as a React key. */
  localId: string;
  /** The original File object from the user's selection. */
  file: File;
  /** The current status of the upload. */
  status: "pending" | "uploading" | "success" | "error";
  /** The upload progress from 0 to 100. */
  progress: number;
  /** The final data returned from the server upon successful upload. */
  result?: FileUploadResponseDto;
  /** An error message if the upload fails. */
  error?: string;
  /** The controller to allow cancelling the upload request. */
  abortController: AbortController;
}

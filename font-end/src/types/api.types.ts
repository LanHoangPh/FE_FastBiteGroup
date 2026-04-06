// types/api.types.ts

// =================================================================
// GENERIC API WRAPPER TYPES
// These interfaces describe the standard structure of API responses.
// =================================================================

export interface ApiError {
  errorCode: string;
  message: string;
}

/**
 * Describes the standard wrapper for most API responses.
 * `T` is a generic type representing the specific `data` payload.
 */
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  errors: ApiError[] | null;
}

/**
 * Describes the structure for APIs that return paginated lists of data.
 */
export interface PagedResult<T> {
  items: T[];
  pageNumber: number;
  pageSize: number;
  totalRecords: number;
  totalPages: number;
}

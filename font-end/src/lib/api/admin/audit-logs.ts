import apiClient from "../apiClient";
import { ApiResponse, PagedResult } from "@/types/api.types";
import {
  AdminAuditLogDto,
  GetAdminAuditLogsParams,
} from "@/types/admin/audit-log.types";

// ===============================
// ADMIN AUDIT LOGS API FUNCTIONS
// ===============================

// Get Audit Logs (List View)
export const getAdminAuditLogs = async (params: GetAdminAuditLogsParams) => {
  const queryParams = new URLSearchParams();

  if (params.pageNumber) {
    queryParams.append("pageNumber", params.pageNumber.toString());
  }
  if (params.pageSize) {
    queryParams.append("pageSize", params.pageSize.toString());
  }
  if (params.adminId) {
    queryParams.append("adminId", params.adminId);
  }
  if (params.actionType) {
    queryParams.append("actionType", params.actionType);
  }
  if (params.targetEntityType) {
    queryParams.append("targetEntityType", params.targetEntityType);
  }
  if (params.targetEntityId) {
    queryParams.append("targetEntityId", params.targetEntityId);
  }
  if (params.startDate) {
    queryParams.append("startDate", params.startDate);
  }
  if (params.endDate) {
    queryParams.append("endDate", params.endDate);
  }
  if (params.batchId) {
    queryParams.append("batchId", params.batchId);
  }

  const response = await apiClient.get<
    ApiResponse<PagedResult<AdminAuditLogDto>>
  >(`/admin/audit-logs?${queryParams.toString()}`);
  return response.data;
};

// Get Audit Log Details
export const getAdminAuditLogDetails = async (id: number) => {
  const response = await apiClient.get<ApiResponse<AdminAuditLogDto>>(
    `/admin/audit-logs/${id}`
  );
  return response.data;
};

// ===============================
// EXPORT JOB API FUNCTIONS
// ===============================

// Export Audit Logs to Excel
export const exportAuditLogsToExcel = async (
  params: GetAdminAuditLogsParams & { timezoneOffsetMinutes?: number }
) => {
  const response = await apiClient.post<ApiResponse<object>>(
    "/admin/audit-logs/export-jobs",
    params
  );
  return response.data;
};

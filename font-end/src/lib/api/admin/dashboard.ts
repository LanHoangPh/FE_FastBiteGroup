import { cache } from "react";
import apiClient from "../apiClient";
import { ApiResponse } from "@/types/api.types";
import {
  DashboardSummaryDto,
  AnalyticsDto,
  TimeRange,
} from "@/types/admin/dashboard.types";

// ===============================
// ADMIN DASHBOARD API FUNCTIONS
// ===============================

// Get Dashboard Summary
export const getDashboardSummary = cache(async () => {
  console.log("Fetching dashboard summary from API..."); // This will now log only once per request
  const response = await apiClient.get<ApiResponse<DashboardSummaryDto>>(
    "/admin/dashboard/summary-ad"
  );
  return response.data;
});

// Get Analytics Charts
export const getAnalyticsCharts = cache(
  async (timeRange: TimeRange = "Last30Days") => {
    console.log(`Fetching analytics charts for timeRange: ${timeRange}...`); // This will now log only once per request
    const response = await apiClient.get<ApiResponse<AnalyticsDto>>(
      `/admin/dashboard/charts?timeRange=${timeRange}`
    );
    return response.data;
  }
);

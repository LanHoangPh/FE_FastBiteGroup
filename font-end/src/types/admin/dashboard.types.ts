// =================================================================
// ADMIN DASHBOARD SPECIFIC TYPES
// These interfaces describe the data models related to admin dashboard.
// =================================================================

/**
 * Describes the key statistics displayed on the admin dashboard.
 */
export interface DashboardKeyStats {
  totalUsers: number;
  newUsersLast7Days: number;
  activeUsersLast7Days: number;
  totalGroups: number;
  totalPosts: number;
  totalVideoCalls: number;
}

/**
 * Describes a single data point in the user growth chart.
 */
export interface UserGrowthDataPoint {
  date: string;
  newUserCount: number;
}

/**
 * Describes a recent user entry for the dashboard.
 */
export interface RecentUser {
  userId: string;
  fullName: string;
  createdAt: string;
}

/**
 * Describes a recent group entry for the dashboard.
 */
export interface RecentGroup {
  groupId: string;
  groupName: string;
  createdAt: string;
}

/**
 * Describes moderation statistics for the dashboard.
 */
export interface DashboardModerationStats {
  pendingReportsCount: number;
  deactivatedUsersCount: number;
}

/**
 * Describes a recent pending report entry.
 */
export interface RecentPendingReport {
  reportId: number;
  contentType: "Post" | "Comment";
  reason: string;
  reportedByUser: string;
  reportedAt: string;
  groupName: string;
  urlToContent: string;
}

/**
 * Describes a recent admin action entry.
 */
export interface RecentAdminAction {
  adminFullName: string;
  actionDescription: string;
  timestamp: string;
}

/**
 * Describes the complete dashboard summary data.
 */
export interface DashboardSummaryDto {
  keyStats: DashboardKeyStats;
  moderationStats: DashboardModerationStats;
  recentUsers: RecentUser[];
  recentGroups: RecentGroup[];
  recentPendingReports: RecentPendingReport[];
  recentAdminActions: RecentAdminAction[];
}

// =================================================================
// ANALYTICS SPECIFIC TYPES
// These interfaces describe the data models related to admin analytics.
// =================================================================

/**
 * Time range options for analytics queries.
 */
export type TimeRange =
  | "Last7Days"
  | "Last30Days"
  | "Last6Months"
  | "Last12Months";

/**
 * Describes a single data point in time-series charts.
 */
export interface ChartDataItemDto {
  date: string; // Format: "yyyy-MM-dd" or "yyyy-MM"
  count: number;
}

/**
 * Describes a single item in classification charts.
 */
export interface ChartItemDto {
  label: string;
  value: number;
}

/**
 * Describes the complete analytics data structure.
 */
export interface AnalyticsDto {
  userGrowthChartData: ChartDataItemDto[];
  groupGrowthChartData: ChartDataItemDto[];
  videoCallChartData: ChartDataItemDto[];
  postGrowthChartData: ChartDataItemDto[];
  commentGrowthChartData: ChartDataItemDto[];
  classificationCharts: {
    userRoleDistribution: ChartItemDto[];
    userStatusDistribution: ChartItemDto[];
    groupTypeDistribution: ChartItemDto[];
    reportStatusDistribution: ChartItemDto[];
  };
}

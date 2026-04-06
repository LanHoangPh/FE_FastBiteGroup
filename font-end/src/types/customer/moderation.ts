/**
 * @description Enum for different types of content that can be reported
 * @corresponds_to EnumReportedContentType from backend
 */
export enum ReportedContentType {
  Post = "Post",
  Comment = "Comment",
}

/**
 * @description Enum for different moderation actions that can be taken
 * @corresponds_to EnumModerationAction from backend
 */
export enum ModerationAction {
  RemoveContent = "RemoveContent",
  DismissReport = "DismissReport",
  RemoveContentAndWarnUser = "RemoveContentAndWarnUser",
  RemoveContentAndBanUser = "RemoveContentAndBanUser",
}

/**
 * @description The request payload for creating a new content report.
 * @note The 'contentType' property has been updated from 'string' to the 'ReportedContentType' enum.
 */
export interface CreateContentReportDto {
  contentId: number;
  contentType: ReportedContentType;
  reason: string;
}

/**
 * @description Represents a single content report item in the moderation queue
 * @response_from GET /api/v1/groups/{groupId}/moderation
 */
export interface GroupReportedContentDto {
  reportId: number;
  contentId: number;
  contentType: ReportedContentType;
  contentPreview: string;
  authorName: string;
  reporterName: string;
  reason: string;
  reportedAt: string; // ISO Date String
}

/**
 * @description The request payload for taking a moderation action
 * @used_in POST /api/v1/groups/{groupId}/moderation/{reportId}/action
 */
export interface ModerationActionDto {
  action: ModerationAction;
}

/**
 * @description Defines query parameters for fetching the pending reports list
 */
export interface GetPendingReportsRequestParams {
  pageParam?: number;
  pageSize?: number;
  contentType?: ReportedContentType | null;
  reporterId?: string | null;
  authorId?: string | null;
  sortBy?: "newest" | "oldest";
}

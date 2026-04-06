import { formatInTimeZone } from "date-fns-tz";

/**
 * Parses an ISO 8601 UTC string and formats it for the Indochina Timezone (UTC+7).
 * @param utcDateString - The date string from the API (e.g., "2025-08-17T10:30:00Z").
 * @returns A formatted string (e.g., "17/08/2025, 17:30:00") or an empty string if input is invalid.
 */
export function formatUtcToIctString(utcDateString?: string | null): string {
  if (!utcDateString) {
    return "";
  }

  try {
    const timeZone = "Asia/Ho_Chi_Minh"; // IANA identifier for UTC+7
    const formatString = "dd/MM/yyyy, HH:mm:ss";

    return formatInTimeZone(utcDateString, timeZone, formatString);
  } catch (error) {
    console.error("Failed to format date:", error);
    return "Invalid Date";
  }
}

/**
 * Formats a date for display in a shorter format (dd/MM/yyyy).
 * @param utcDateString - The date string from the API.
 * @returns A formatted string (e.g., "17/08/2025") or an empty string if input is invalid.
 */
export function formatUtcToIctDate(utcDateString?: string | null): string {
  if (!utcDateString) {
    return "";
  }

  try {
    const timeZone = "Asia/Ho_Chi_Minh";
    const formatString = "dd/MM/yyyy";

    return formatInTimeZone(utcDateString, timeZone, formatString);
  } catch (error) {
    console.error("Failed to format date:", error);
    return "Invalid Date";
  }
}

/**
 * Formats a date for display in a time-only format (HH:mm:ss).
 * @param utcDateString - The date string from the API.
 * @returns A formatted string (e.g., "17:30:00") or an empty string if input is invalid.
 */
export function formatUtcToIctTime(utcDateString?: string | null): string {
  if (!utcDateString) {
    return "";
  }

  try {
    const timeZone = "Asia/Ho_Chi_Minh";
    const formatString = "HH:mm:ss";

    return formatInTimeZone(utcDateString, timeZone, formatString);
  } catch (error) {
    console.error("Failed to format time:", error);
    return "Invalid Time";
  }
}

/**
 * Formats a date for display in a relative format (e.g., "2 giờ trước", "1 ngày trước").
 * @param utcDateString - The date string from the API.
 * @returns A formatted relative string or the full date if too old.
 */
export function formatUtcToIctRelative(utcDateString?: string | null): string {
  if (!utcDateString) {
    return "";
  }

  try {
    const timeZone = "Asia/Ho_Chi_Minh";
    const now = new Date();
    const date = new Date(utcDateString);

    const diffInMinutes = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60)
    );

    if (diffInMinutes < 1) {
      return "Vừa xong";
    } else if (diffInMinutes < 60) {
      return `${diffInMinutes} phút trước`;
    } else if (diffInMinutes < 1440) {
      // 24 hours
      const diffInHours = Math.floor(diffInMinutes / 60);
      return `${diffInHours} giờ trước`;
    } else if (diffInMinutes < 43200) {
      // 30 days
      const diffInDays = Math.floor(diffInMinutes / 1440);
      return `${diffInDays} ngày trước`;
    } else {
      // For older dates, show the full date
      return formatInTimeZone(utcDateString, timeZone, "dd/MM/yyyy");
    }
  } catch (error) {
    console.error("Failed to format relative date:", error);
    return "Invalid Date";
  }
}

/**
 * Formats a date for general display purposes.
 * This is a convenience function that uses the full date and time format.
 * @param utcDateString - The date string from the API.
 * @returns A formatted string (e.g., "17/08/2025, 17:30:00") or an empty string if input is invalid.
 */
export function formatDate(utcDateString?: string | null): string {
  return formatUtcToIctString(utcDateString);
}

/**
 * Format a date to show relative time (e.g., "5 hours ago", "2 days ago")
 */
export function formatRelativeTime(utcDateString?: string | null): string {
  if (!utcDateString) return "Chưa có hoạt động";

  const date = new Date(utcDateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) {
    return "Vừa xong";
  }

  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return `${diffInMinutes} phút trước`;
  }

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `${diffInHours} giờ trước`;
  }

  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) {
    return `${diffInDays} ngày trước`;
  }

  const diffInWeeks = Math.floor(diffInDays / 7);
  if (diffInWeeks < 4) {
    return `${diffInWeeks} tuần trước`;
  }

  const diffInMonths = Math.floor(diffInDays / 30);
  if (diffInMonths < 12) {
    return `${diffInMonths} tháng trước`;
  }

  const diffInYears = Math.floor(diffInDays / 365);
  return `${diffInYears} năm trước`;
}

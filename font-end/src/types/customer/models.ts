// types/models.ts

// =================================================================
// SHARED MODEL TYPES
// These interfaces describe common data models used across the application.
// =================================================================

/**
 * Enum representing the possible presence statuses for a user.
 */
export enum UserPresenceStatus {
  Online = "Online",
  Offline = "Offline",
  Busy = "Busy",
  Absent = "Absent",
}

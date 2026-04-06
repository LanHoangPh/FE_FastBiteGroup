// =================================================================
// ADMIN SETTINGS TYPES
// These interfaces describe the data models for admin settings management.
// =================================================================

/**
 * All possible setting keys that can be managed in the admin panel.
 */
export type SettingKey =
  | "SiteName"
  | "MaintenanceMode"
  | "AllowNewRegistrations"
  | "RequireEmailConfirmation"
  | "DefaultRoleForNewUsers"
  | "ForbiddenKeywords"
  | "AutoLockAccountThreshold"
  | "MaxFileSizeMb"
  | "MaxAvatarSizeMb"
  | "AllowedFileTypes";

/**
 * The DTO for data received from the GET /api/admin/settings endpoint.
 * All values are returned as strings from the API.
 */
export type AdminSettingsDto = Record<SettingKey, string>;

/**
 * The DTO for the PUT /api/admin/settings request body.
 * Only changed settings should be included.
 */
export interface UpdateSettingsRequest {
  settings: Partial<AdminSettingsDto>;
}

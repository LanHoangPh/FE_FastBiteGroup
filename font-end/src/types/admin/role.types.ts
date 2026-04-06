// =================================================================
// ADMIN ROLE MANAGEMENT SPECIFIC TYPES
// These interfaces describe the data models for admin role management.
// =================================================================

/**
 * The main DTO for a role in the admin view
 */
export interface RoleDto {
  id: string; // Guid
  name: string;
  userCount: number; // The number of users currently assigned this role
  isSystemRole: boolean; // Indicates if this is a system-protected role
}

/**
 * DTO for creating a new role
 */
export interface CreateRoleRequest {
  roleName: string;
}

/**
 * DTO for updating an existing role
 */
export interface UpdateRoleRequest {
  newRoleName: string;
}

// types/auth.types.ts

// =================================================================
// AUTHENTICATION SPECIFIC TYPES
// These interfaces describe the data models related to authentication.
// =================================================================

/**
 * Describes the detailed user information returned after a successful login.
 */
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  fullName: string;
  avatarUrl: string | null;
  roles: string[];
}

/**
 * Describes the `data` object within the response of a successful login API call.
 */
export interface AuthData {
  rememberMe: boolean;
  accessToken: string;
  refreshToken: string;
  user: User;
  requiresTwoFactor?: boolean; // Optional flag for 2FA requirement
}

/**
 * Describes the response data from the OTP verification step in forgot password flow.
 */
export interface VerifyResetOtpResponse {
  resetToken: string;
}

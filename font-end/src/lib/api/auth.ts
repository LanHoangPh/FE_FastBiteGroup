import apiClient from "./apiClient";
import { ApiResponse } from "@/types/api.types";
import { AuthData, VerifyResetOtpResponse } from "@/types/auth.types";
import { LoginFormData, RegisterFormData } from "@/lib/schemas/auth.schema";

// ===============================
// AUTHENTICATION API FUNCTIONS
// ===============================

// Login User
export const loginUser = async (
  data: LoginFormData
): Promise<ApiResponse<AuthData>> => {
  const response = await apiClient.post<ApiResponse<AuthData>>(
    "/Auth/login",
    data
  );
  return response.data; // BE
};

// Register User
export const registerUser = async (data: RegisterFormData) => {
  const response = await apiClient.post<ApiResponse<string>>("/Auth/register", {
    ...data,
    dateOfBirth: data.dateOfBirth.toISOString(),
  });
  return response.data;
};

// Confirm Email
export const confirmEmail = async ({
  userId,
  token,
}: {
  userId: string;
  token: string;
}) => {
  const response = await apiClient.get<ApiResponse<string>>(
    `/Auth/confirm-email?userId=${userId}&token=${token}`
  );
  return response.data;
};

// Resend Confirmation Email
export const resendConfirmationEmail = async (email: string) => {
  // Dữ liệu gửi đi dưới dạng raw string, cần bọc trong JSON.stringify
  const response = await apiClient.post<ApiResponse<string>>(
    "/Auth/resend-confirmation",
    JSON.stringify(email),
    {
      headers: {
        "Content-Type": "application/json",
      },
    }
  );
  return response.data;
};

// Logout User
export const logoutUser = async (refreshToken: string) => {
  const response = await apiClient.post<ApiResponse<object>>("/Auth/logout", {
    refreshToken,
  });
  return response.data;
};

// ===============================
// FORGOT PASSWORD API FUNCTIONS
// ===============================

// Step 1: Request Password Reset OTP
export const forgotPassword = async (email: string) => {
  const response = await apiClient.post<ApiResponse<object>>(
    "/Auth/forgot-password",
    { email }
  );
  return response.data;
};

// Step 2: Verify OTP
export const verifyResetOtp = async (data: { email: string; otp: string }) => {
  const response = await apiClient.post<ApiResponse<VerifyResetOtpResponse>>(
    "/Auth/verify-reset-otp",
    data
  );
  return response.data;
};

// Step 3: Reset Password
export const resetPassword = async (data: {
  email: string;
  resetToken: string;
  newPassword: string;
}) => {
  const response = await apiClient.post<ApiResponse<object>>(
    "/Auth/reset-password",
    data
  );
  return response.data;
};

// ===============================
// TWO-FACTOR AUTHENTICATION (2FA) API FUNCTIONS
// ===============================

// Verify 2FA OTP
export const verifyTwoFactor = async (data: {
  email: string;
  code: string;
  rememberMe: boolean;
}) => {
  const response = await apiClient.post<ApiResponse<AuthData>>(
    "/Auth/verify-2fa",
    data
  );
  return response.data;
};

// Send 2FA Code (Resend)
export const sendTwoFactorCode = async (email: string) => {
  const response = await apiClient.post<ApiResponse<object>>(
    "/Auth/send-2fa-code",
    { email }
  );
  return response.data;
};

import axios from "axios";
import Cookies from "js-cookie";
import { useAuthStore } from "@/store/authStore";
import { ApiResponse } from "@/types/api.types";
import { AuthData } from "@/types/auth.types";

// Disable SSL certificate validation for development
// if (process.env.NODE_ENV === "development") {
//   process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
// }

const apiClient = axios.create({
  baseURL: "https://localhost:7007/api/v1",
});

// Request Interceptor: Tự động gắn AccessToken vào mỗi request
apiClient.interceptors.request.use(
  (config) => {
    const accessToken = useAuthStore.getState().accessToken;
    if (accessToken && config.headers) {
      config.headers["Authorization"] = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Xử lý khi AccessToken hết hạn
apiClient.interceptors.response.use(
  (response) => response, // Trả về response nếu không có lỗi
  async (error: Error | any) => {
    const originalRequest = error.config;
    const authStore = useAuthStore.getState();

    // Chỉ xử lý lỗi 401 và khi request đó chưa phải là request thử lại
    if (
      error.response?.status === 401 &&
      originalRequest &&
      !originalRequest._isRetry
    ) {
      originalRequest._isRetry = true; // Đánh dấu là đã thử lại

      try {
        const refreshToken = authStore.refreshToken;
        if (!refreshToken) {
          authStore.logout();
          return Promise.reject(error);
        }

        // Gọi API để làm mới token
        const response = await apiClient.post<ApiResponse<AuthData>>(
          "/Auth/refresh-token",
          { token: refreshToken }
        );

        const { accessToken: newAccessToken, refreshToken: newRefreshToken } =
          response.data.data;

        // Cập nhật token mới vào store và cookie
        authStore.login(
          response.data.data.user,
          newAccessToken,
          newRefreshToken
        );
        Cookies.set("auth_token", newAccessToken);

        // Cập nhật header của request gốc và thực hiện lại nó
        originalRequest.headers["Authorization"] = `Bearer ${newAccessToken}`;
        return apiClient(originalRequest);
      } catch (refreshError) {
        // Nếu refresh token thất bại, đăng xuất người dùng
        authStore.logout();
        window.location.href = "/auth/login";
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;

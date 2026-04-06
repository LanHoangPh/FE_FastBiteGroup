"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/store/authStore";
import { Wifi, Info, AlertTriangle, CheckCircle, XCircle } from "lucide-react";
import { useState, useEffect } from "react";

export function SignalRDebugInfo() {
  const { accessToken, isAuthenticated, user } = useAuthStore();
  const [isExpanded, setIsExpanded] = useState(false);
  const [clientChecks, setClientChecks] = useState<{
    isHttpsOrLocalhost: boolean;
    hasWebSocket: boolean;
    hasEventSource: boolean;
    currentOrigin: string;
    userAgent: string;
  } | null>(null);

  const hubUrl = `${
    process.env.NEXT_PUBLIC_API_URL || "https://localhost:7007"
  }/hubs/admin`;

  // Initialize client-side checks after component mounts
  useEffect(() => {
    setClientChecks({
      isHttpsOrLocalhost:
        window.location.protocol === "https:" ||
        window.location.hostname === "localhost",
      hasWebSocket: "WebSocket" in window,
      hasEventSource: "EventSource" in window,
      currentOrigin: window.location.origin,
      userAgent: navigator.userAgent,
    });
  }, []);

  // Check various connection prerequisites
  const checks = [
    {
      name: "Xác thực người dùng",
      status: isAuthenticated,
      description: isAuthenticated ? "Đã đăng nhập" : "Chưa đăng nhập",
    },
    {
      name: "Quyền Admin",
      status: user?.roles?.includes("Admin"),
      description: user?.roles?.includes("Admin")
        ? "Có quyền admin"
        : "Không có quyền admin",
    },
    {
      name: "Access Token",
      status: !!accessToken,
      description: accessToken ? "Token có sẵn" : "Không có token",
    },
    {
      name: "HTTPS/Localhost",
      status: clientChecks?.isHttpsOrLocalhost ?? false,
      description: clientChecks?.isHttpsOrLocalhost
        ? "Môi trường hỗ trợ SignalR"
        : "Cần HTTPS hoặc localhost",
    },
    {
      name: "WebSocket Support",
      status: clientChecks?.hasWebSocket ?? false,
      description: clientChecks?.hasWebSocket
        ? "Trình duyệt hỗ trợ WebSocket"
        : "Không hỗ trợ WebSocket",
    },
    {
      name: "EventSource Support",
      status: clientChecks?.hasEventSource ?? false,
      description: clientChecks?.hasEventSource
        ? "Trình duyệt hỗ trợ Server-Sent Events"
        : "Không hỗ trợ SSE",
    },
  ];

  const allChecksPass = checks.every((check) => check.status);
  const criticalChecksFail =
    !isAuthenticated || !user?.roles?.includes("Admin") || !accessToken;

  const testConnection = async () => {
    try {
      console.log("[Debug] Testing connection to:", hubUrl);

      // Test basic connectivity to the endpoint
      const response = await fetch(
        `${
          process.env.NEXT_PUBLIC_API_URL || "https://localhost:7007"
        }/api/v1/admin/notification`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      console.log("[Debug] Health check response:", response.status);
    } catch (error) {
      console.error("[Debug] Connection test failed:", error);
    }
  };

  if (!isExpanded) {
    return (
      <Card className="border-dashed">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {allChecksPass ? (
                <CheckCircle className="h-4 w-4 text-green-600" />
              ) : criticalChecksFail ? (
                <XCircle className="h-4 w-4 text-red-600" />
              ) : (
                <AlertTriangle className="h-4 w-4 text-yellow-600" />
              )}
              <span className="text-sm font-medium">
                SignalR Connection Status
              </span>
              <Badge variant={allChecksPass ? "default" : "destructive"}>
                {allChecksPass ? "Ready" : "Issues Detected"}
              </Badge>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsExpanded(true)}
            >
              <Info className="h-4 w-4 mr-1" />
              Debug Info
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wifi className="h-5 w-5" />
          SignalR Connection Debugging
        </CardTitle>
        <CardDescription>
          Thông tin chẩn đoán để khắc phục sự cố kết nối thời gian thực
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Connection Prerequisites */}
        <div>
          <h4 className="font-medium mb-2">Connection Prerequisites</h4>
          <div className="grid gap-2">
            {checks.map((check, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-2 rounded border"
              >
                <div className="flex items-center gap-2">
                  {check.status ? (
                    <CheckCircle className="h-4 w-4 text-success" />
                  ) : (
                    <XCircle className="h-4 w-4 text-destructive" />
                  )}
                  <span className="text-sm font-medium">{check.name}</span>
                </div>
                <div className="text-sm text-muted-foreground">
                  {check.description}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Connection Details */}
        <div>
          <h4 className="font-medium mb-2">Connection Details</h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Hub URL:</span>
              <code className="text-xs bg-muted px-1 rounded">{hubUrl}</code>
            </div>
            {clientChecks && (
              <>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Current Origin:</span>
                  <code className="text-xs bg-muted px-1 rounded">
                    {clientChecks.currentOrigin}
                  </code>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">User Agent:</span>
                  <code className="text-xs bg-muted px-1 rounded max-w-md truncate">
                    {clientChecks.userAgent}
                  </code>
                </div>
              </>
            )}
            {accessToken && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Token Length:</span>
                <span className="text-xs">{accessToken.length} characters</span>
              </div>
            )}
          </div>
        </div>

        {/* Troubleshooting Steps */}
        <div>
          <h4 className="font-medium mb-2">Troubleshooting Steps</h4>
          <div className="text-sm space-y-1 text-muted-foreground">
            <p>
              1. Đảm bảo backend ASP.NET Core đang chạy tại:{" "}
              <code>
                {process.env.NEXT_PUBLIC_API_URL || "https://localhost:7007"}
              </code>
            </p>
            <p>
              2. Kiểm tra SignalR Hub được cấu hình tại:{" "}
              <code>/hubs/admin</code>
            </p>
            <p>3. Xác nhận CORS policy cho phép SignalR connections</p>
            <p>4. Kiểm tra JWT token có quyền admin hợp lệ</p>
            <p>5. Nếu sử dụng proxy, đảm bảo WebSocket được hỗ trợ</p>
            <p>6. Thử tắt firewall/antivirus tạm thời</p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-4 border-t">
          <Button variant="outline" size="sm" onClick={testConnection}>
            Test Backend Connection
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              console.log("[Debug] Current auth state:", {
                isAuthenticated,
                user,
                hasToken: !!accessToken,
              });
              console.log(
                "[Debug] Environment:",
                process.env.NEXT_PUBLIC_API_URL
              );
            }}
          >
            Log Debug Info
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsExpanded(false)}
          >
            Collapse
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

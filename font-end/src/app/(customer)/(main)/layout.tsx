"use client";

import { useState } from "react";
import { CustomerSidebar } from "@/layout/customer/CustomerSidebar";
import { PresenceProvider } from "@/providers/PresenceProvider";
import { NotificationProvider } from "@/providers/NotificationProvider";
import { NotificationsHubProvider } from "@/providers/NotificationsHubProvider";
import { VideoCallProvider } from "@/providers/VideoCallDirectProvider";
import { VideoCallManager } from "@/components/features/video-call/calldirect/VideoCallManager";
import { useOneSignalSubscription } from "@/hooks/useOneSignalSubscription";
import { cn } from "@/lib/utils";

export default function CustomerMainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  // This hook will now manage the push notification subscription lifecycle
  useOneSignalSubscription();

  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  return (
    <VideoCallProvider>
      <PresenceProvider>
        <NotificationProvider>
          <NotificationsHubProvider>
            <div className="min-h-screen bg-background">
              {/* Customer Sidebar - Fixed positioned */}
              <CustomerSidebar isCollapsed={isSidebarCollapsed} />

              {/* Main Content Area - With proper margin to account for fixed sidebar */}
              <div
                className={cn(
                  "flex flex-col min-h-screen transition-all duration-300",
                  // Mobile: no margin, sidebar overlays
                  "ml-0",
                  // Desktop: fixed 64px margin for minimal sidebar
                  "md:ml-16"
                )}
              >
                {/* Mobile Sidebar Toggle - Only show on mobile */}
                <div className="md:hidden fixed top-4 left-4 z-50">
                  <button
                    onClick={toggleSidebar}
                    className="p-2 rounded-md bg-background/95 backdrop-blur hover:bg-accent transition-colors shadow-lg"
                  >
                    <svg
                      className="h-5 w-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 6h16M4 12h16M4 18h16"
                      />
                    </svg>
                  </button>
                </div>

                {/* Main Content */}
                <main className="min-h-screen customer-bg-gradient">
                  <div className="h-full">{children}</div>
                </main>
                <VideoCallManager />
              </div>
            </div>
          </NotificationsHubProvider>
        </NotificationProvider>
      </PresenceProvider>
    </VideoCallProvider>
  );
}

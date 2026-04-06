"use client";

import { CommunitySidebar } from "@/components/features/communities/CommunitySidebar";

export default function CommunitiesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Left Column (Persistent) - Community List */}
      <aside className="w-80 border-r border-gray-200 dark:border-gray-700 flex-shrink-0 bg-white dark:bg-gray-900">
        <CommunitySidebar />
      </aside>

      {/* Center/Right Columns (Dynamic) - Community Content */}
      <main className="flex-1 min-w-0 bg-gray-50 dark:bg-gray-800">
        {children}
      </main>
    </div>
  );
}

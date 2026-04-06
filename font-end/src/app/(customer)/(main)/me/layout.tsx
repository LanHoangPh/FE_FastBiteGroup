"use client";

import { SettingsSidebar } from "@/components/features/settings/SettingsSidebar";

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="customer-bg-gradient min-h-screen">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-br from-blue-500/10 via-purple-500/8 to-indigo-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div
          className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-tr from-purple-500/10 via-blue-500/8 to-cyan-500/10 rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: "1s" }}
        ></div>
        <div
          className="absolute top-1/3 right-1/4 w-72 h-72 bg-gradient-to-r from-indigo-500/8 via-purple-500/5 to-pink-500/8 rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: "2s" }}
        ></div>
      </div>

      <div className="relative z-10">
        <div className="container mx-auto grid grid-cols-1 lg:grid-cols-4 gap-8 py-8 px-6">
          <aside className="lg:col-span-1">
            <div className="sticky top-8">
              <SettingsSidebar />
            </div>
          </aside>
          <main className="lg:col-span-3">
            <div className="backdrop-blur-xl bg-white/10 dark:bg-gray-900/20 border border-white/20 dark:border-gray-700/30 rounded-3xl p-8 shadow-2xl">
              {children}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}

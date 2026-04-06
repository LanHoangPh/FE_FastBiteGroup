import { ConversationSidebar } from "@/components/features/chat/ConversationSidebar";
import { ChatHubProvider } from "@/providers/ChatHubProvider";

export default function ChatLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ChatHubProvider>
      <div className="flex h-screen overflow-hidden bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50 dark:from-gray-950 dark:via-slate-900 dark:to-gray-900">
        <aside className="w-80 border-r border-gray-200/80 dark:border-gray-700/60 bg-white/80 dark:bg-gray-950/90 backdrop-blur-xl flex-shrink-0 shadow-xl shadow-slate-200/20 dark:shadow-gray-900/40">
          <ConversationSidebar />
        </aside>
        <main className="flex-1 min-w-0 relative">
          {/* Subtle background pattern */}
          <div className="absolute inset-0 opacity-5 dark:opacity-10">
            <div
              className="w-full h-full"
              style={{
                backgroundImage: `radial-gradient(circle at 25% 25%, #6366f1 0%, transparent 50%), 
                               radial-gradient(circle at 75% 75%, #8b5cf6 0%, transparent 50%)`,
              }}
            />
          </div>
          <div className="relative z-10 h-full">{children}</div>
        </main>
      </div>
    </ChatHubProvider>
  );
}

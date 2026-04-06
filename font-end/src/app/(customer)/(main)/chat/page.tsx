import { MessageSquare, Sparkles, ArrowRight } from "lucide-react";

export default function ChatDefaultPage() {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center px-8">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-r from-blue-400/10 to-purple-400/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-gradient-to-r from-purple-400/10 to-pink-400/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      {/* Main content */}
      <div className="relative z-10 max-w-lg">
        {/* Icon with gradient background */}
        <div className="relative mb-8">
          <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/25 mx-auto transform hover:scale-105 transition-transform duration-300">
            <MessageSquare className="h-12 w-12 text-white" />
          </div>
          <Sparkles className="absolute -top-2 -right-2 h-6 w-6 text-yellow-400 animate-bounce" />
        </div>

        {/* Title */}
        <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent mb-4">
          Chọn một cuộc trò chuyện
        </h2>

        {/* Description */}
        <p className="text-lg text-gray-600 dark:text-gray-400 mb-8 leading-relaxed">
          Bắt đầu nhắn tin hoặc chọn một cuộc trò chuyện từ danh sách bên trái
          để tiếp tục.
        </p>

        {/* Action hint */}
        <div className="flex items-center justify-center gap-2 text-sm text-gray-500 dark:text-gray-500 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm rounded-full px-6 py-3 border border-gray-200/50 dark:border-gray-700/50">
          <span>Nhấn vào cuộc trò chuyện để bắt đầu</span>
          <ArrowRight className="h-4 w-4 animate-pulse" />
        </div>
      </div>
    </div>
  );
}

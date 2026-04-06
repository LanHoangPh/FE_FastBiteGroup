import { Users, MessageSquare, TrendingUp, Sparkles } from "lucide-react";

export default function CommunitiesPage() {
  return (
    <div className="flex items-center justify-center h-full p-8">
      <div className="text-center max-w-2xl">
        {/* Icon with gradient background */}
        <div className="relative mb-8">
          <div className="w-24 h-24 bg-gradient-to-br from-indigo-500/20 via-purple-500/20 to-pink-500/20 rounded-full flex items-center justify-center backdrop-blur-sm border border-indigo-200/30 dark:border-indigo-800/30 shadow-2xl mx-auto">
            <Users className="h-12 w-12 text-indigo-600 dark:text-indigo-400" />
          </div>
          <Sparkles className="absolute -top-2 -right-2 h-8 w-8 text-yellow-500 animate-bounce delay-300" />
          <div className="absolute -bottom-2 -left-2 w-6 h-6 bg-gradient-to-r from-purple-400 to-pink-500 rounded-full opacity-60 animate-pulse" />
        </div>

        <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 via-indigo-700 to-purple-600 dark:from-gray-100 dark:via-indigo-300 dark:to-purple-400 bg-clip-text text-transparent mb-4">
          Chọn một cộng đồng để bắt đầu
        </h1>

        <p className="text-lg text-gray-600 dark:text-gray-400 mb-8 leading-relaxed">
          Khám phá các cộng đồng bạn đã tham gia từ thanh bên trái và bắt đầu
          tương tác với các thành viên khác
        </p>

        {/* Feature highlights */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
          <div className="p-6 rounded-2xl bg-white/60 dark:bg-gray-800/60 border border-gray-200/40 dark:border-gray-700/40 backdrop-blur-sm hover:scale-105 transition-all duration-200">
            <MessageSquare className="h-8 w-8 text-blue-600 dark:text-blue-400 mx-auto mb-3" />
            <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">
              Thảo luận
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Tham gia các cuộc thảo luận sôi nổi với cộng đồng
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white/60 dark:bg-gray-800/60 border border-gray-200/40 dark:border-gray-700/40 backdrop-blur-sm hover:scale-105 transition-all duration-200">
            <TrendingUp className="h-8 w-8 text-green-600 dark:text-green-400 mx-auto mb-3" />
            <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">
              Xu hướng
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Theo dõi các bài viết hot và xu hướng mới nhất
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white/60 dark:bg-gray-800/60 border border-gray-200/40 dark:border-gray-700/40 backdrop-blur-sm hover:scale-105 transition-all duration-200">
            <Users className="h-8 w-8 text-purple-600 dark:text-purple-400 mx-auto mb-3" />
            <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">
              Kết nối
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Kết nối và giao lưu với những người cùng sở thích
            </p>
          </div>
        </div>

        {/* Decorative animated dots */}
        <div className="flex justify-center gap-2 mt-8">
          <div
            className="w-2 h-2 bg-gradient-to-r from-indigo-400 to-purple-500 rounded-full animate-bounce"
            style={{ animationDelay: "0s" }}
          />
          <div
            className="w-2 h-2 bg-gradient-to-r from-purple-400 to-pink-500 rounded-full animate-bounce"
            style={{ animationDelay: "0.1s" }}
          />
          <div
            className="w-2 h-2 bg-gradient-to-r from-pink-400 to-red-500 rounded-full animate-bounce"
            style={{ animationDelay: "0.2s" }}
          />
        </div>
      </div>
    </div>
  );
}

import { Users } from "lucide-react";

export default function GroupsDefaultPage() {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center bg-gray-50 dark:bg-gray-900">
      <Users className="h-16 w-16 text-gray-400 mb-4" />
      <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200">
        Chọn một nhóm chat
      </h2>
      <p className="text-gray-500 dark:text-gray-400">
        Bắt đầu nhắn tin hoặc chọn một nhóm chat từ danh sách bên trái.
      </p>
    </div>
  );
}
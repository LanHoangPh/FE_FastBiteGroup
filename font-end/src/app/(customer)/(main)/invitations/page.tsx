import { PendingInvitationsList } from "@/components/features/invitations/PendingInvitationsList";
import { Mail } from "lucide-react";

export default function InvitationsPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Page Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-gradient-to-r from-cyan-500 to-purple-600 rounded-lg flex items-center justify-center">
            <Mail className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              Lời mời
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Quản lý các lời mời tham gia nhóm của bạn
            </p>
          </div>
        </div>
      </div>

      {/* Invitations Content */}
      <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-6">
        <PendingInvitationsList />
      </div>
    </div>
  );
}

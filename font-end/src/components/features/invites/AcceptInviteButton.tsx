"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { LogIn, UserPlus, Loader2 } from "lucide-react";

import { acceptInviteLink } from "@/lib/api/customer/invites";
import { useAuthStore } from "@/store/authStore";
import { handleApiError } from "@/lib/utils/errorUtils";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface AcceptInviteButtonProps {
  invitationCode: string;
  groupName: string;
}

export function AcceptInviteButton({
  invitationCode,
  groupName,
}: AcceptInviteButtonProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { isAuthenticated } = useAuthStore();

  // Accept invite mutation
  const acceptInviteMutation = useMutation({
    mutationFn: () => acceptInviteLink(invitationCode),
    onSuccess: (data) => {
      toast.success(`Chào mừng bạn đến với nhóm ${groupName}!`);

      // Invalidate conversations to update the user's group list
      queryClient.invalidateQueries({ queryKey: ["conversations"] });

      // Redirect to the group's chat page
      router.push(`/chat/conversations/${data.defaultConversationId}`);
    },
    onError: (error: any) => {
      // Handle specific error codes
      const axiosError = error as {
        response?: {
          data?: {
            errors?: Array<{ errorCode?: string; message?: string }>;
            message?: string;
          };
        };
      };

      const errorCode = axiosError.response?.data?.errors?.[0]?.errorCode;

      if (errorCode === "AlreadyMember") {
        toast.info("Bạn đã là thành viên của nhóm này.", {
          description: "Bạn sẽ được chuyển đến nhóm chat ngay.",
        });
        // Still redirect to conversations if they're already a member
        router.push("/chat");
      } else if (errorCode === "GroupNotFound") {
        toast.error("Nhóm không tồn tại", {
          description: "Nhóm này có thể đã bị xóa hoặc không còn khả dụng.",
        });
      } else if (errorCode === "InviteLinkExpired") {
        toast.error("Lời mời đã hết hạn", {
          description: "Vui lòng yêu cầu người gửi tạo link mời mới.",
        });
      } else if (errorCode === "InviteLinkUsedUp") {
        toast.error("Lời mời đã hết lượt sử dụng", {
          description: "Link mời này đã đạt giới hạn số người có thể sử dụng.",
        });
      } else {
        // Use the standard error handler for other errors
        handleApiError(error, "Không thể tham gia nhóm");
      }
    },
  });

  const handleAcceptInvite = () => {
    acceptInviteMutation.mutate();
  };

  const handleLoginRedirect = () => {
    // Store the current invite URL to redirect back after login
    const currentUrl = window.location.href;
    const loginUrl = `/login?redirect=${encodeURIComponent(currentUrl)}`;
    router.push(loginUrl);
  };

  if (!isAuthenticated) {
    return (
      <Button
        onClick={handleLoginRedirect}
        size="lg"
        className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium shadow-lg hover:shadow-xl transition-all duration-200"
      >
        <LogIn className="h-5 w-5 mr-2" />
        Đăng nhập để tham gia
      </Button>
    );
  }

  return (
    <Button
      onClick={handleAcceptInvite}
      disabled={acceptInviteMutation.isPending}
      size="lg"
      className="w-full bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white font-medium shadow-lg hover:shadow-xl transition-all duration-200"
    >
      {acceptInviteMutation.isPending ? (
        <>
          <Loader2 className="h-5 w-5 mr-2 animate-spin" />
          Đang tham gia...
        </>
      ) : (
        <>
          <UserPlus className="h-5 w-5 mr-2" />
          Chấp nhận lời mời
        </>
      )}
    </Button>
  );
}

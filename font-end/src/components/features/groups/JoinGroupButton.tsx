"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { joinPublicGroup } from "@/lib/api/customer/groups";
import { handleApiError } from "@/lib/utils/errorUtils";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { MessageSquare } from "lucide-react";
import { GroupDetailsPreviewDto } from "@/types/customer/group";

interface JoinGroupButtonProps {
  group: GroupDetailsPreviewDto;
}

export function JoinGroupButton({ group }: JoinGroupButtonProps) {
  const router = useRouter();
  const queryClient = useQueryClient();

  const joinMutation = useMutation({
    mutationFn: () => joinPublicGroup(group.groupId),
    onSuccess: (response) => {
      toast.success(`Chào mừng bạn đến với nhóm "${group.groupName}"!`);

      // Invalidate queries to refresh user's group list and conversations
      queryClient.invalidateQueries({ queryKey: ["myProfile"] });
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
      queryClient.invalidateQueries({
        queryKey: ["groupDetails", group.groupId],
      });

      // Redirect user to the group's chat
      router.push(`/chat/conversations/${response.defaultConversationId}`);
    },
    onError: (error: any) => {
      // Use handleApiError for all API errors - it will handle the error display
      handleApiError(error, "Không thể tham gia nhóm");
    },
  });

  // if (group.isCurrentUserMember) {
  //   return (
  //     <Button disabled className="w-full sm:w-auto">
  //       <MessageSquare className="h-4 w-4 mr-2" />
  //       Đã tham gia
  //     </Button>
  //   );
  // }

  return (
    <Button
      onClick={() => joinMutation.mutate()}
      disabled={joinMutation.isPending}
      className="w-full sm:w-auto"
    >
      {joinMutation.isPending ? (
        <>
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
          Đang xử lý...
        </>
      ) : (
        <>
          <MessageSquare className="h-4 w-4 mr-2" />
          Tham gia Nhóm
        </>
      )}
    </Button>
  );
}

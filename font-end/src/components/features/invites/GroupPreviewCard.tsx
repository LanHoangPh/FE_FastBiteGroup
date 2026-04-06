import { Users } from "lucide-react";

import { GroupPreviewDto } from "@/types/customer/group";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { AcceptInviteButton } from "./AcceptInviteButton";

interface GroupPreviewCardProps {
  groupPreview: GroupPreviewDto;
  invitationCode: string;
}

export function GroupPreviewCard({
  groupPreview,
  invitationCode,
}: GroupPreviewCardProps) {
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="customer-glass-card p-8">
      <div className="text-center space-y-6">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-xl font-semibold text-white">
            Bạn được mời tham gia nhóm
          </h1>
          <p className="text-white/70 text-sm">
            Nhấn vào nút bên dưới để tham gia nhóm này
          </p>
        </div>

        {/* Group Info */}
        <div className="space-y-4">
          <div className="relative inline-block">
            <Avatar className="h-20 w-20 mx-auto border-4 border-white/20">
              <AvatarImage src={groupPreview.groupAvatarUrl} />
              <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-500 text-white font-bold text-lg">
                {getInitials(groupPreview.groupName)}
              </AvatarFallback>
            </Avatar>
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-white">
              {groupPreview.groupName}
            </h2>

            <div className="flex items-center justify-center">
              <Badge
                variant="secondary"
                className="bg-white/10 text-white/90 border-white/20"
              >
                <Users className="h-3 w-3 mr-1" />
                {groupPreview.memberCount} thành viên
              </Badge>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="pt-4">
          <AcceptInviteButton
            invitationCode={invitationCode}
            groupName={groupPreview.groupName}
          />
        </div>

        {/* Footer */}
        <div className="text-center pt-4 border-t border-white/10">
          <p className="text-white/60 text-xs">
            Sử dụng FastBite Group để kết nối với bạn bè và cộng đồng
          </p>
        </div>
      </div>
    </div>
  );
}

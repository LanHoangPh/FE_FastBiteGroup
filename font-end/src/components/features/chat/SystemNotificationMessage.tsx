import { MessageDto } from "@/types/customer/user.types";

interface SystemNotificationMessageProps {
  message: MessageDto;
}

export function SystemNotificationMessage({ message }: SystemNotificationMessageProps) {
  return (
    <div className="flex justify-center my-4">
      <div className="bg-muted text-muted-foreground text-xs px-3 py-1 rounded-full">
        {message.content}
      </div>
    </div>
  );
}
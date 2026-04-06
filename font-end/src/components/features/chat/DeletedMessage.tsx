import { MessageDto } from "@/types/customer/user.types";

interface DeletedMessageProps {
  message: MessageDto; // Component now accepts the message object
}

export function DeletedMessage({ message }: DeletedMessageProps) {
  return (
    <div className="flex justify-center my-2">
      <div className="bg-gray-50 dark:bg-gray-800/50 text-gray-500 dark:text-gray-400 text-xs px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 italic flex items-center gap-2">
        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
        {/* Render the content from the API response */}
        {message.content}
      </div>
    </div>
  );
}

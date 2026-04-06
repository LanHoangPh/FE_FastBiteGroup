import { Loader2 } from "lucide-react";

/**
 * This is a special Next.js file that automatically creates a Suspense boundary.
 * It will be shown instantly as a fallback UI during page navigation
 * while the actual page content is being server-rendered.
 */
export default function AdminLoading() {
  return (
    <div className="flex h-screen w-full items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-2">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">Đang tải trang...</p>
      </div>
    </div>
  );
}

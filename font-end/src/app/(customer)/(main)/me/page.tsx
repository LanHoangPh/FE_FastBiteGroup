"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

// This is a redirect page that sends users to the profile page by default
export default function MeIndexPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/me/profile");
  }, [router]);

  return (
    <div className="flex items-center justify-center h-full">
      <div className="w-8 h-8 border-2 border-t-transparent border-blue-500 rounded-full animate-spin"></div>
    </div>
  );
}

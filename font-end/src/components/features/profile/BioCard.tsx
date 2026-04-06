"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Edit2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface BioCardProps {
  bio?: string;
  onEdit?: () => void;
}

export function BioCard({ bio, onEdit }: BioCardProps) {
  return (
    <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-0 shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg font-semibold text-slate-800 dark:text-white">
          Giới thiệu
        </CardTitle>
        {onEdit && (
          <Button variant="ghost" size="sm" className="gap-2" onClick={onEdit}>
            <Edit2 className="h-4 w-4" />
            <span className="hidden sm:inline">Chỉnh sửa</span>
          </Button>
        )}
      </CardHeader>
      <CardContent>
        {bio ? (
          <p className="text-slate-600 dark:text-slate-300 whitespace-pre-line">
            {bio}
          </p>
        ) : (
          <p className="text-slate-400 dark:text-slate-500 italic">
            Chưa có thông tin giới thiệu. Hãy thêm một vài thông tin về bạn.
          </p>
        )}
      </CardContent>
    </Card>
  );
}

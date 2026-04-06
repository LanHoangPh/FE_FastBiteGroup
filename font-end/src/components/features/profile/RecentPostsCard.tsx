"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Calendar, ArrowRight } from "lucide-react";
import Link from "next/link";
import { MyPostInfoDto } from "@/types/customer/user.types";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";

interface RecentPostsCardProps {
  posts: MyPostInfoDto[];
}

export function RecentPostsCard({ posts }: RecentPostsCardProps) {
  return (
    <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-0 shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg font-semibold text-slate-800 dark:text-white">
          Bài viết gần đây
        </CardTitle>
        <div className="bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-full px-2 py-0.5 text-xs font-medium">
          {posts.length}
        </div>
      </CardHeader>
      <CardContent>
        {posts.length > 0 ? (
          <div className="space-y-3">
            {posts.slice(0, 5).map((post) => (
              <Link
                key={post.postId}
                href={`/communities/${post.postId}`}
                className="flex items-center gap-3 p-2 rounded-md hover:bg-slate-100 dark:hover:bg-slate-700/50 transition-colors"
              >
                <div className="bg-green-100 dark:bg-green-900/30 rounded-md p-2 flex-shrink-0">
                  <FileText className="h-5 w-5 text-green-600 dark:text-green-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-slate-800 dark:text-white truncate">
                    {post.title}
                  </p>
                  <div className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
                    <Calendar className="h-3 w-3" />
                    <span>
                      {formatDistanceToNow(new Date(post.createdAt), {
                        addSuffix: true,
                        locale: vi,
                      })}
                    </span>
                  </div>
                </div>
                <ArrowRight className="h-4 w-4 text-slate-400" />
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-6">
            <div className="bg-slate-100 dark:bg-slate-800 rounded-full p-3 inline-flex mb-3">
              <FileText className="h-6 w-6 text-slate-400" />
            </div>
            <p className="text-slate-600 dark:text-slate-400 mb-3">
              Bạn chưa tạo bài viết nào
            </p>
            <Button size="sm" variant="outline">
              Tạo bài viết mới
            </Button>
          </div>
        )}
      </CardContent>
      {posts.length > 5 && (
        <CardFooter>
          <Button variant="ghost" className="w-full text-green-600" size="sm">
            Xem tất cả ({posts.length})
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}

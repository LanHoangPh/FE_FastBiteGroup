"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Users, ArrowRight } from "lucide-react";
import Link from "next/link";
import { MyGroupInfoDto } from "@/types/customer/user.types";

interface MyGroupsCardProps {
  groups: MyGroupInfoDto[];
}

export function MyGroupsCard({ groups }: MyGroupsCardProps) {
  return (
    <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-0 shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg font-semibold text-slate-800 dark:text-white">
          Nhóm của tôi
        </CardTitle>
        <div className="bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full px-2 py-0.5 text-xs font-medium">
          {groups.length}
        </div>
      </CardHeader>
      <CardContent>
        {groups.length > 0 ? (
          <div className="space-y-3">
            {groups.slice(0, 5).map((group) => (
              <Link
                key={group.groupId}
                href={`/groups/${group.groupId}`}
                className="flex items-center gap-3 p-2 rounded-md hover:bg-slate-100 dark:hover:bg-slate-700/50 transition-colors"
              >
                <Avatar className="h-10 w-10">
                  <AvatarImage
                    src={group.groupAvatarUrl}
                    alt={group.groupName}
                  />
                  <AvatarFallback className="bg-blue-100 text-blue-600 dark:bg-blue-900/50 dark:text-blue-400">
                    {group.groupName.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-slate-800 dark:text-white truncate">
                    {group.groupName}
                  </p>
                </div>
                <ArrowRight className="h-4 w-4 text-slate-400" />
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-6">
            <div className="bg-slate-100 dark:bg-slate-800 rounded-full p-3 inline-flex mb-3">
              <Users className="h-6 w-6 text-slate-400" />
            </div>
            <p className="text-slate-600 dark:text-slate-400 mb-3">
              Bạn chưa tham gia nhóm nào
            </p>
            <Button size="sm" variant="outline">
              Khám phá nhóm
            </Button>
          </div>
        )}
      </CardContent>
      {groups.length > 5 && (
        <CardFooter>
          <Button variant="ghost" className="w-full text-blue-600" size="sm">
            Xem tất cả ({groups.length})
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}

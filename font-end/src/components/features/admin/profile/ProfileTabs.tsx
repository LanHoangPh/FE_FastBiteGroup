"use client";

import { MyAdminProfileDto } from "@/types/admin/user.types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PersonalInformationTab } from "@/components/features/admin/profile/PersonalInformationTab";
import { SecurityTab } from "@/components/features/admin/profile/SecurityTab";
import { LoginHistoryTab } from "@/components/features/admin/profile/LoginHistoryTab";
import { RecentActionsTab } from "@/components/features/admin/profile/RecentActionsTab";
import { Settings, Shield, Clock, Activity } from "lucide-react";

interface ProfileTabsProps {
  profileData: MyAdminProfileDto;
}

export function ProfileTabs({ profileData }: ProfileTabsProps) {
  return (
    <Card className="border-0 shadow-sm bg-gradient-to-br from-card to-card/80 backdrop-blur-sm">
      <CardHeader className="pb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/20 rounded-xl">
            <Settings className="h-6 w-6 text-primary" />
          </div>
          <div>
            <CardTitle className="text-2xl">Quản lý Hồ sơ</CardTitle>
            <p className="text-muted-foreground">
              Quản lý thông tin cá nhân, bảo mật và theo dõi hoạt động
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="px-6 pb-6">
        <Tabs defaultValue="personal" className="w-full">
          <TabsList className="grid w-full grid-cols-4 h-12 p-1 bg-muted/50 rounded-xl">
            <TabsTrigger
              value="personal"
              className="flex items-center gap-2 rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm transition-all duration-200"
            >
              <Settings className="h-4 w-4" />
              <span className="hidden sm:inline">Thông tin cá nhân</span>
            </TabsTrigger>
            <TabsTrigger
              value="security"
              className="flex items-center gap-2 rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm transition-all duration-200"
            >
              <Shield className="h-4 w-4" />
              <span className="hidden sm:inline">Bảo mật</span>
            </TabsTrigger>
            <TabsTrigger
              value="login-history"
              className="flex items-center gap-2 rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm transition-all duration-200"
            >
              <Clock className="h-4 w-4" />
              <span className="hidden sm:inline">Lịch sử đăng nhập</span>
            </TabsTrigger>
            <TabsTrigger
              value="recent-actions"
              className="flex items-center gap-2 rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm transition-all duration-200"
            >
              <Activity className="h-4 w-4" />
              <span className="hidden sm:inline">Hoạt động gần đây</span>
            </TabsTrigger>
          </TabsList>

          <div className="mt-8">
            <TabsContent value="personal" className="space-y-0">
              <PersonalInformationTab profileData={profileData} />
            </TabsContent>

            <TabsContent value="security" className="space-y-0">
              <SecurityTab profileData={profileData} />
            </TabsContent>

            <TabsContent value="login-history" className="space-y-0">
              <LoginHistoryTab loginHistory={profileData.loginHistory} />
            </TabsContent>

            <TabsContent value="recent-actions" className="space-y-0">
              <RecentActionsTab recentActions={profileData.recentActions} />
            </TabsContent>
          </div>
        </Tabs>
      </CardContent>
    </Card>
  );
}

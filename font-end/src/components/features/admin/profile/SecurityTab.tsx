"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { changeAdminPassword } from "@/lib/api/admin/users";
import { MyAdminProfileDto } from "@/types/admin/user.types";
import {
  changePasswordSchema,
  type ChangePasswordFormData,
} from "@/lib/schemas/auth.schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Loader2, Key } from "lucide-react";
import { toast } from "sonner";

interface SecurityTabProps {
  profileData: MyAdminProfileDto;
}

export function SecurityTab({ profileData }: SecurityTabProps) {
  const form = useForm<ChangePasswordFormData>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmNewPassword: "",
    },
  });

  // Change Password Mutation
  const changePasswordMutation = useMutation({
    mutationFn: changeAdminPassword,
    onSuccess: () => {
      toast.success("Đổi mật khẩu thành công!");
      form.reset();
    },
    onError: (error: any) => {
      toast.error("Không thể đổi mật khẩu", {
        description:
          error?.response?.data?.message || "Đã xảy ra lỗi. Vui lòng thử lại.",
      });
    },
  });

  const onSubmit = (data: ChangePasswordFormData) => {
    changePasswordMutation.mutate(data);
  };

  return (
    <div className="space-y-6">
      {/* Change Password Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="h-5 w-5" />
            Đổi mật khẩu
          </CardTitle>
          <CardDescription>
            Cập nhật mật khẩu tài khoản của bạn để đảm bảo an toàn.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="currentPassword">Mật khẩu hiện tại</Label>
              <Input
                id="currentPassword"
                type="password"
                maxLength={50}
                {...form.register("currentPassword")}
                placeholder="Nhập mật khẩu hiện tại"
              />
              {form.formState.errors.currentPassword && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.currentPassword.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="newPassword">Mật khẩu mới</Label>
              <Input
                id="newPassword"
                type="password"
                maxLength={50}
                {...form.register("newPassword")}
                placeholder="Nhập mật khẩu mới"
              />
              {form.formState.errors.newPassword && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.newPassword.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmNewPassword">Xác nhận mật khẩu mới</Label>
              <Input
                id="confirmNewPassword"
                type="password"
                maxLength={50}
                {...form.register("confirmNewPassword")}
                placeholder="Xác nhận mật khẩu mới"
              />
              {form.formState.errors.confirmNewPassword && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.confirmNewPassword.message}
                </p>
              )}
            </div>

            <Button
              type="submit"
              disabled={changePasswordMutation.isPending}
              className="w-full"
            >
              {changePasswordMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Đang đổi mật khẩu...
                </>
              ) : (
                "Đổi mật khẩu"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

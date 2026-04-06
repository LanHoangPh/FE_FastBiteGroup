"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import {
  deactivateAccount,
  requestAccountDeletion,
} from "@/lib/api/customer/me";
import { logoutUser } from "@/lib/api/auth";
import { handleApiError } from "@/lib/utils/errorUtils";
import { toast } from "sonner";
import {
  AlertTriangle,
  UserMinus,
  UserX,
  AlertCircle,
  LogOut,
} from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import Cookies from "js-cookie";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  deleteAccountSchema,
  DeleteAccountFormData,
  deactivateAccountSchema,
  DeactivateAccountFormData,
} from "@/lib/schemas/customer/user.schema";
import { Alert, AlertDescription } from "@/components/ui/alert";

export function AccountActionsCard() {
  const [isDeactivateDialogOpen, setIsDeactivateDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  // Get auth store functions and data
  const refreshToken = useAuthStore((state) => state.refreshToken);
  const logoutFromStore = useAuthStore((state) => state.logout);

  const deactivateForm = useForm<DeactivateAccountFormData>({
    resolver: zodResolver(deactivateAccountSchema),
    defaultValues: {
      currentPassword: "",
    },
  });

  const deleteForm = useForm<DeleteAccountFormData>({
    resolver: zodResolver(deleteAccountSchema),
    defaultValues: {
      password: "",
    },
  });

  // Logout mutation
  const logoutMutation = useMutation({
    mutationFn: async () => {
      if (refreshToken) {
        await logoutUser(refreshToken);
      }
      return;
    },
    onSettled: () => {
      // Clean up auth data
      Cookies.remove("auth_token");
      logoutFromStore();

      try {
        // If OneSignal is available, logout from there too
        if (typeof window !== "undefined" && window.OneSignal) {
          window.OneSignal.logout();
        }
      } catch (error) {
        console.error("Error logging out from OneSignal:", error);
      }

      // Redirect to home page
      window.location.href = "/";
    },
  });

  const deactivateMutation = useMutation({
    mutationFn: deactivateAccount,
    onSuccess: () => {
      toast.success("Tài khoản của bạn đã được vô hiệu hóa");
      setIsDeactivateDialogOpen(false);

      // Perform logout
      toast.info("Bạn sẽ được đăng xuất ngay lập tức", {
        description: "Đang đăng xuất...",
        duration: 3000,
      });

      // Trigger logout after a short delay to allow toast to be seen
      setTimeout(() => {
        logoutMutation.mutate();
      }, 1500);
    },
    onError: (error) => {
      handleApiError(error, "Không thể vô hiệu hóa tài khoản");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: requestAccountDeletion,
    onSuccess: () => {
      toast.success(
        "Yêu cầu xóa tài khoản đã được gửi. Tài khoản của bạn sẽ bị xóa trong vòng 30 ngày."
      );
      setIsDeleteDialogOpen(false);

      // Perform logout
      toast.info("Bạn sẽ được đăng xuất ngay lập tức", {
        description: "Đang đăng xuất...",
        duration: 3000,
      });

      // Trigger logout after a short delay to allow toast to be seen
      setTimeout(() => {
        logoutMutation.mutate();
      }, 1500);
    },
    onError: (error) => {
      handleApiError(error, "Không thể xóa tài khoản");
    },
  });

  const onDeactivateSubmit = (data: DeactivateAccountFormData) => {
    deactivateMutation.mutate(data);
  };

  const onDeleteSubmit = (data: DeleteAccountFormData) => {
    deleteMutation.mutate(data);
  };

  return (
    <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-0 shadow-sm border-red-200 dark:border-red-900/50">
      <CardHeader className="border-b border-red-100 dark:border-red-900/20">
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-red-500" />
          <CardTitle className="text-lg font-semibold text-red-600 dark:text-red-400">
            Khu vực nguy hiểm
          </CardTitle>
        </div>
        <CardDescription className="text-red-600/70 dark:text-red-400/70">
          Các hành động dưới đây có thể ảnh hưởng nghiêm trọng đến tài khoản của
          bạn
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="space-y-6">
          <div>
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-medium text-slate-900 dark:text-white">
                  Vô hiệu hóa tài khoản
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Tài khoản của bạn sẽ bị vô hiệu hóa tạm thời và có thể kích
                  hoạt lại sau.
                </p>
              </div>
              <AlertDialog
                open={isDeactivateDialogOpen}
                onOpenChange={setIsDeactivateDialogOpen}
              >
                <AlertDialogTrigger asChild>
                  <Button
                    variant="outline"
                    className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 dark:border-red-900/50 dark:text-red-400 dark:hover:bg-red-900/20"
                  >
                    <UserMinus className="mr-2 h-4 w-4" />
                    Vô hiệu hóa
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Vô hiệu hóa tài khoản?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Tài khoản của bạn sẽ bị vô hiệu hóa và bạn sẽ không thể
                      đăng nhập cho đến khi kích hoạt lại.{" "}
                      <strong className="text-red-600 dark:text-red-400">
                        Bạn sẽ bị đăng xuất ngay lập tức.
                      </strong>{" "}
                      Để xác nhận, vui lòng nhập mật khẩu của bạn.
                    </AlertDialogDescription>
                  </AlertDialogHeader>

                  <Form {...deactivateForm}>
                    <form
                      onSubmit={deactivateForm.handleSubmit(onDeactivateSubmit)}
                      className="space-y-4"
                    >
                      <FormField
                        control={deactivateForm.control}
                        name="currentPassword"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Mật khẩu</FormLabel>
                            <FormControl>
                              <Input
                                type="password"
                                placeholder="Nhập mật khẩu hiện tại"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <Alert
                        variant="destructive"
                        className="bg-red-50 text-red-800 dark:bg-red-900/20 dark:text-red-400 dark:border-red-900/50"
                      >
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>
                          <p>
                            Hành động này sẽ vô hiệu hóa tài khoản của bạn ngay
                            lập tức.
                          </p>
                          <p className="mt-1 flex items-center gap-1">
                            <LogOut className="h-3.5 w-3.5" />
                            <span className="font-medium">
                              Bạn sẽ bị đăng xuất ngay sau khi xác nhận.
                            </span>
                          </p>
                        </AlertDescription>
                      </Alert>

                      <AlertDialogFooter>
                        <AlertDialogCancel>Hủy</AlertDialogCancel>
                        <Button
                          type="submit"
                          variant="destructive"
                          disabled={deactivateMutation.isPending}
                        >
                          {deactivateMutation.isPending ? (
                            <>
                              <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                              Đang xử lý...
                            </>
                          ) : (
                            <>
                              <UserMinus className="mr-2 h-4 w-4" />
                              Vô hiệu hóa tài khoản
                            </>
                          )}
                        </Button>
                      </AlertDialogFooter>
                    </form>
                  </Form>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>

          <div className="h-px bg-slate-200 dark:bg-slate-700" />

          <div>
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-medium text-slate-900 dark:text-white">
                  Xóa tài khoản
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Tài khoản của bạn và tất cả dữ liệu sẽ bị xóa vĩnh viễn sau 30
                  ngày.
                </p>
              </div>
              <AlertDialog
                open={isDeleteDialogOpen}
                onOpenChange={setIsDeleteDialogOpen}
              >
                <AlertDialogTrigger asChild>
                  <Button variant="destructive">
                    <UserX className="mr-2 h-4 w-4" />
                    Xóa tài khoản
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>
                      Xóa tài khoản vĩnh viễn?
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                      Hành động này không thể hoàn tác. Tài khoản của bạn sẽ bị
                      xóa vĩnh viễn sau 30 ngày.{" "}
                      <strong className="text-red-600 dark:text-red-400">
                        Bạn sẽ bị đăng xuất ngay lập tức.
                      </strong>{" "}
                      Để xác nhận, vui lòng nhập mật khẩu của bạn.
                    </AlertDialogDescription>
                  </AlertDialogHeader>

                  <Form {...deleteForm}>
                    <form
                      onSubmit={deleteForm.handleSubmit(onDeleteSubmit)}
                      className="space-y-4"
                    >
                      <FormField
                        control={deleteForm.control}
                        name="password"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Mật khẩu</FormLabel>
                            <FormControl>
                              <Input
                                type="password"
                                placeholder="Nhập mật khẩu hiện tại"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <Alert
                        variant="destructive"
                        className="bg-red-50 text-red-800 dark:bg-red-900/20 dark:text-red-400 dark:border-red-900/50"
                      >
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>
                          <p>
                            Tất cả dữ liệu của bạn sẽ bị xóa vĩnh viễn và không
                            thể khôi phục.
                          </p>
                          <p className="mt-1 flex items-center gap-1">
                            <LogOut className="h-3.5 w-3.5" />
                            <span className="font-medium">
                              Bạn sẽ bị đăng xuất ngay sau khi xác nhận.
                            </span>
                          </p>
                        </AlertDescription>
                      </Alert>

                      <AlertDialogFooter>
                        <AlertDialogCancel>Hủy</AlertDialogCancel>
                        <Button
                          type="submit"
                          variant="destructive"
                          disabled={deleteMutation.isPending}
                        >
                          {deleteMutation.isPending ? (
                            <>
                              <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                              Đang xử lý...
                            </>
                          ) : (
                            <>
                              <UserX className="mr-2 h-4 w-4" />
                              Xóa tài khoản
                            </>
                          )}
                        </Button>
                      </AlertDialogFooter>
                    </form>
                  </Form>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

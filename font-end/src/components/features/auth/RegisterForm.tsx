"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useMutation } from "@tanstack/react-query";
import { formatUtcToIctDate } from "@/lib/utils/dateUtils";
import { toast } from "sonner";

import { registerUser } from "@/lib/api/auth";
import {
  registerSchema,
  type RegisterFormData,
} from "@/lib/schemas/auth.schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { CalendarIcon, MessageCircle, Eye, EyeOff } from "lucide-react";

export function RegisterForm() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const form = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const { mutate, isPending } = useMutation({
    mutationFn: registerUser,
    onSuccess: (response) => {
      if (response.success) {
        toast.success("Đăng ký thành công!", {
          description: "Vui lòng kiểm tra email để xác thực tài khoản.",
          duration: 3000,
        });
        router.push("/login");
      } else {
        toast.error("Đăng ký thất bại", {
          description: response.errors?.[0]?.message || response.message,
        });
      }
    },
    onError: () => {
      toast.error("Đã có lỗi xảy ra", {
        description: "Không thể kết nối đến máy chủ. Vui lòng thử lại.",
      });
    },
  });

  const onSubmit = (data: RegisterFormData) => {
    mutate(data);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#6a11cb] to-[#2575fc] dark:from-gray-900 dark:via-black dark:to-gray-800 flex items-center justify-center p-4">
      <Card className="w-full max-w-md animate-in slide-in-from-bottom-4 duration-500 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm border border-white/20 dark:border-gray-700/30 shadow-xl">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <MessageCircle className="h-7 w-7 text-purple-600  dark:text-cyan-400" />
            <span className="text-2xl font-bold text-gray-900 dark:text-white">
              TeamChat
            </span>
          </div>
          <CardTitle className="text-2xl">Tạo tài khoản</CardTitle>
          <CardDescription>Điền thông tin của bạn để bắt đầu</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">Tên</Label>
                <Input
                  id="firstName"
                  placeholder="Vd: An"
                  {...form.register("firstName")}
                  maxLength={25}
                  onChange={(e) => {
                    const value = e.target.value.slice(0, 25);
                    form.setValue("firstName", value);
                  }}
                />
                {form.formState.errors.firstName && (
                  <p className="text-red-500 text-sm">
                    {form.formState.errors.firstName.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Họ</Label>
                <Input
                  id="lastName"
                  placeholder="Vd: Nguyễn Văn"
                  {...form.register("lastName")}
                  maxLength={20}
                  onChange={(e) => {
                    const value = e.target.value.slice(0, 20);
                    form.setValue("lastName", value);
                  }}
                />
                {form.formState.errors.lastName && (
                  <p className="text-red-500 text-sm">
                    {form.formState.errors.lastName.message}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="dateOfBirth">Ngày sinh</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !form.watch("dateOfBirth") && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {form.watch("dateOfBirth") ? (
                      formatUtcToIctDate(
                        form.watch("dateOfBirth").toISOString()
                      )
                    ) : (
                      <span>Chọn ngày sinh(Phải trên 16)</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={form.watch("dateOfBirth")}
                    onSelect={(date) => {
                      if (date) {
                        // Validate age when date is selected
                        const today = new Date();
                        const minAgeDate = new Date(
                          today.getFullYear() - 16,
                          today.getMonth(),
                          today.getDate()
                        );
                        const maxBirthDate = new Date("1900-01-01");

                        if (date > minAgeDate) {
                          form.setError("dateOfBirth", {
                            type: "manual",
                            message: "Bạn phải từ 16 tuổi trở lên",
                          });
                        } else if (date < maxBirthDate) {
                          form.setError("dateOfBirth", {
                            type: "manual",
                            message: "Ngày sinh không hợp lệ",
                          });
                        } else {
                          form.clearErrors("dateOfBirth");
                          form.setValue("dateOfBirth", date, {
                            shouldValidate: true,
                          });
                        }
                      } else {
                        form.clearErrors("dateOfBirth");
                        form.setValue("dateOfBirth", undefined as any, {
                          shouldValidate: true,
                        });
                      }
                    }}
                    disabled={(date) => {
                      const today = new Date();
                      const minAgeDate = new Date(
                        today.getFullYear() - 16,
                        today.getMonth(),
                        today.getDate()
                      );
                      return (
                        date > today ||
                        date < new Date("1900-01-01") ||
                        date > minAgeDate
                      );
                    }}
                    captionLayout="dropdown"
                  />
                </PopoverContent>
              </Popover>
              {form.formState.errors.dateOfBirth && (
                <p className="text-red-500 text-sm">
                  {form.formState.errors.dateOfBirth.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="email@example.com"
                {...form.register("email")}
                maxLength={40}
                onChange={(e) => {
                  const value = e.target.value.slice(0, 40);
                  form.setValue("email", value);
                }}
              />
              {form.formState.errors.email && (
                <p className="text-red-500 text-sm">
                  {form.formState.errors.email.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Mật khẩu</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  {...form.register("password")}
                  maxLength={40}
                  onChange={(e) => {
                    const value = e.target.value.slice(0, 40);
                    form.setValue("password", value);
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-500" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-500" />
                  )}
                </button>
              </div>
              {form.formState.errors.password && (
                <p className="text-red-500 text-sm">
                  {form.formState.errors.password.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Xác nhận mật khẩu</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  {...form.register("confirmPassword")}
                  maxLength={40}
                  onChange={(e) => {
                    const value = e.target.value.slice(0, 40);
                    form.setValue("confirmPassword", value);
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-500" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-500" />
                  )}
                </button>
              </div>
              {form.formState.errors.confirmPassword && (
                <p className="text-red-500 text-sm">
                  {form.formState.errors.confirmPassword.message}
                </p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full bg-purple-600 hover:bg-purple-700 dark:bg-cyan-600 dark:hover:bg-cyan-700"
              disabled={isPending}
            >
              {isPending ? "Đang xử lý..." : "Tạo tài khoản"}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex justify-center">
          <p className="text-sm text-gray-600">
            Đã có tài khoản?{" "}
            <Link
              href="/login"
              className="text-sm font-medium text-purple-600 hover:underline dark:text-cyan-400 dark:hover:text-cyan-300"
            >
              Đăng nhập ngay
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}

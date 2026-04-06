import { z } from "zod";
import { MessagingPrivacy } from "@/types/customer/user.types";

// For PUT /me/profile
export const updateProfileSchema = z.object({
  firstName: z.string().min(1, { message: "Tên không được để trống." }),
  lastName: z.string().min(1, { message: "Họ không được để trống." }),
  dateOfBirth: z.date().optional(),
  bio: z
    .string()
    .max(500, { message: "Mô tả không được vượt quá 500 ký tự." })
    .optional(),
  twoFactorEnabled: z.boolean(),
});
export type UpdateProfileFormData = z.infer<typeof updateProfileSchema>;

// For PUT /me/password
export const changePasswordSchema = z
  .object({
    currentPassword: z
      .string()
      .min(1, { message: "Mật khẩu hiện tại không được để trống." }),
    newPassword: z
      .string()
      .min(8, { message: "Mật khẩu mới phải có ít nhất 8 ký tự." }),
    confirmNewPassword: z
      .string()
      .min(1, { message: "Xác nhận mật khẩu không được để trống." }),
  })
  .refine((data) => data.newPassword === data.confirmNewPassword, {
    message: "Mật khẩu mới và xác nhận mật khẩu không khớp.",
    path: ["confirmNewPassword"],
  });
export type ChangePasswordFormData = z.infer<typeof changePasswordSchema>;

// For POST /me/delete-request
export const deleteAccountSchema = z.object({
  password: z.string().min(1, { message: "Mật khẩu không được để trống." }),
});
export type DeleteAccountFormData = z.infer<typeof deleteAccountSchema>;

// For POST /me/deactivate
export const deactivateAccountSchema = z.object({
  currentPassword: z
    .string()
    .min(1, { message: "Mật khẩu không được để trống." }),
});
export type DeactivateAccountFormData = z.infer<typeof deactivateAccountSchema>;

// For PUT /me/settings/privacy
export const updatePrivacySettingsSchema = z.object({
  messagingPrivacy: z.nativeEnum(MessagingPrivacy, {
    message: "Vui lòng chọn một cài đặt hợp lệ.",
  }),
});
export type UpdatePrivacySettingsFormData = z.infer<
  typeof updatePrivacySettingsSchema
>;

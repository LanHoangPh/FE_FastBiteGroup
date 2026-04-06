import { z } from "zod";

// Schema for creating a new user by admin
export const createUserByAdminSchema = z.object({
  firstName: z
    .string()
    .min(1, { message: "Tên không được để trống." })
    .max(50, { message: "Tên không được vượt quá 50 ký tự." }),
  lastName: z
    .string()
    .min(1, { message: "Họ không được để trống." })
    .max(50, { message: "Họ không được vượt quá 50 ký tự." }),
  email: z.string().email({ message: "Email không hợp lệ." }),
  userName: z
    .string()
    .min(3, { message: "Tên đăng nhập phải có ít nhất 3 ký tự." })
    .max(30, { message: "Tên đăng nhập không được vượt quá 30 ký tự." })
    .regex(/^[a-zA-Z0-9_]+$/, {
      message: "Tên đăng nhập chỉ được chứa chữ cái, số và dấu gạch dưới.",
    }),
  roleName: z.string().min(1, { message: "Vai trò không được để trống." }),
});

export type CreateUserByAdminFormData = z.infer<typeof createUserByAdminSchema>;

// Schema for updating user basic info
export const updateUserBasicInfoSchema = z.object({
  firstName: z
    .string()
    .min(1, { message: "Tên không được để trống." })
    .max(50, { message: "Tên không được vượt quá 50 ký tự." }),
  lastName: z
    .string()
    .min(1, { message: "Họ không được để trống." })
    .max(50, { message: "Họ không được vượt quá 50 ký tự." }),
  dateOfBirth: z
    .string()
    .optional()
    .refine(
      (date) => {
        if (!date) return true;
        const parsedDate = new Date(date);
        return !isNaN(parsedDate.getTime()) && parsedDate < new Date();
      },
      { message: "Ngày sinh không hợp lệ." }
    ),
});

export type UpdateUserBasicInfoFormData = z.infer<
  typeof updateUserBasicInfoSchema
>;

// Schema for deactivating user
export const deactivateUserSchema = z.object({
  reasonCategory: z.string().min(1, { message: "Lý do không được để trống." }),
  reasonDetails: z
    .string()
    .max(500, { message: "Chi tiết lý do không được vượt quá 500 ký tự." })
    .optional(),
});

export type DeactivateUserFormData = z.infer<typeof deactivateUserSchema>;

// Schema for role assignment
export const roleAssignmentSchema = z.object({
  roleName: z.string().min(1, { message: "Vai trò không được để trống." }),
});

export type RoleAssignmentFormData = z.infer<typeof roleAssignmentSchema>;

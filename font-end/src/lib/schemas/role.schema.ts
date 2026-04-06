import { z } from "zod";

// Schema for creating a new role
export const createRoleSchema = z.object({
  roleName: z
    .string()
    .min(1, { message: "Tên vai trò không được để trống." })
    .max(50, { message: "Tên vai trò không được vượt quá 50 ký tự." }),
});

export type CreateRoleFormData = z.infer<typeof createRoleSchema>;

// Schema for updating an existing role
export const updateRoleSchema = z.object({
  newRoleName: z
    .string()
    .min(1, { message: "Tên vai trò không được để trống." })
    .max(50, { message: "Tên vai trò không được vượt quá 50 ký tự." }),
});

export type UpdateRoleFormData = z.infer<typeof updateRoleSchema>;

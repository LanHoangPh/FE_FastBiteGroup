// src/lib/schemas/customer/group.schema.ts
import { z } from "zod";
import { GroupType, EnumGroupPrivacy } from "@/types/customer/group";

const MAX_AVATAR_SIZE_MB = 2;
const ACCEPTED_IMAGE_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
];

export const createChatGroupSchema = z.object({
  groupName: z
    .string()
    .min(1, "Tên nhóm không được để trống.")
    .max(20, "Tên nhóm không được vượt quá 20 ký tự."),
  description: z
    .string()
    .max(100, "Mô tả không được vượt quá 100 ký tự.")
    .optional(),
  groupType: z
    .nativeEnum(GroupType)
    .refine((type) => type === GroupType.Public || type === GroupType.Private, {
      message: "Loại nhóm cho nhóm chat chỉ có thể là 'Public' hoặc 'Private'.",
    }),
  avatarFile: z
    .any()
    .refine(
      (file) => !file || file.size <= MAX_AVATAR_SIZE_MB * 1024 * 1024,
      `Ảnh đại diện không được lớn hơn ${MAX_AVATAR_SIZE_MB}MB.`
    )
    .refine(
      (file) => !file || ACCEPTED_IMAGE_TYPES.includes(file.type),
      "Chỉ hỗ trợ các định dạng .jpg, .jpeg, .png và .webp."
    )
    .optional(),
});

export type CreateChatGroupFormData = z.infer<typeof createChatGroupSchema>;

export const updateGroupInfoSchema = z.object({
  groupName: z
    .string()
    .min(1, "Tên nhóm không được để trống.")
    .max(100, "Tên nhóm không được vượt quá 100 ký tự."),
  description: z
    .string()
    .max(500, "Mô tả không được vượt quá 500 ký tự.")
    .optional(),
  privacy: z.nativeEnum(EnumGroupPrivacy),
});

export type UpdateGroupInfoFormData = z.infer<typeof updateGroupInfoSchema>;

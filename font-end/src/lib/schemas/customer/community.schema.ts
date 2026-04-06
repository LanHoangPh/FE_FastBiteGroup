import { z } from "zod";
import { EnumGroupPrivacy as GroupPrivacy } from "@/types/customer/group";

const MAX_AVATAR_SIZE_MB = 2;
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

export const createCommunityGroupSchema = z.object({
  groupName: z
    .string()
    .min(1, "Tên cộng đồng không được để trống.")
    .max(15, "Tên cộng đồng không được vượt quá 15 ký tự."), // Custom FE validation
  description: z
    .string()
    .max(30, "Mô tả không được vượt quá 30 ký tự.") // Custom FE validation
    .optional()
    .or(z.literal("")), // Allow empty string
  privacy: z.nativeEnum(GroupPrivacy).refine(
    (val) => Object.values(GroupPrivacy).includes(val),
    { message: "Vui lòng chọn quyền riêng tư." }
  ),
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

export type CreateCommunityGroupFormData = z.infer<typeof createCommunityGroupSchema>;

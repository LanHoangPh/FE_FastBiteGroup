import { z } from "zod";

export const createGroupSchema = z.object({
  groupName: z.string().min(1, { message: "Tên nhóm là bắt buộc." }),
  description: z.string().optional(),
  groupType: z.enum(["Public", "Private", "Community"], {
    message: "Vui lòng chọn loại nhóm.",
  }),
  initialAdminUserIds: z
    .array(z.string())
    .min(1, { message: "Phải có ít nhất một quản trị viên." }),
});

export type CreateGroupFormData = z.infer<typeof createGroupSchema>;

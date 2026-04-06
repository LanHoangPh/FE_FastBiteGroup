import { z } from "zod";

export const reportContentSchema = z.object({
  reason: z
    .string()
    .min(10, { message: "Lý do báo cáo phải có ít nhất 10 ký tự" })
    .max(500, { message: "Lý do báo cáo không được vượt quá 500 ký tự" }),
});

export type ReportContentFormData = z.infer<typeof reportContentSchema>;

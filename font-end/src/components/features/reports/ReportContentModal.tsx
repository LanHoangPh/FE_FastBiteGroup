"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { reportContent } from "@/lib/api/customer/groups";
import {
  CreateContentReportDto,
  ReportedContentType,
} from "@/types/customer/moderation";
import { reportContentSchema } from "../../../lib/schemas/customer/report.schema";

interface ReportContentModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  contentId: number;
  groupId: string;
  contentType: ReportedContentType;
  onReportSuccess?: () => void;
}

export function ReportContentModal({
  isOpen,
  onOpenChange,
  contentId,
  groupId,
  contentType,
  onReportSuccess,
}: ReportContentModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const queryClient = useQueryClient();

  const form = useForm<z.infer<typeof reportContentSchema>>({
    resolver: zodResolver(reportContentSchema),
    defaultValues: {
      reason: "",
    },
  });

  const mutation = useMutation({
    mutationFn: (data: CreateContentReportDto) => reportContent(groupId, data),
    onSuccess: () => {
      toast.success("Báo cáo đã được gửi thành công");
      form.reset();
      onOpenChange(false);
      if (onReportSuccess) {
        onReportSuccess();
      }
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ["group-posts", groupId] });
    },
    onError: (error) => {
      console.error("Failed to submit report:", error);
      toast.error("Không thể gửi báo cáo. Vui lòng thử lại.");
    },
  });

  const onSubmit = (values: z.infer<typeof reportContentSchema>) => {
    const payload: CreateContentReportDto = {
      contentId,
      contentType,
      reason: values.reason,
    };

    mutation.mutate(payload);
  };

  const handleClose = () => {
    if (!isSubmitting) {
      onOpenChange(false);
      form.reset();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold text-slate-900 dark:text-slate-100">
            Báo cáo nội dung
          </DialogTitle>
          <DialogDescription className="text-slate-600 dark:text-slate-400">
            Vui lòng mô tả lý do bạn báo cáo nội dung này. Nhóm quản trị sẽ xem
            xét và xử lý theo quy định.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="reason"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Lý do báo cáo</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Mô tả lý do bạn báo cáo nội dung này..."
                      className="resize-none"
                      rows={4}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={isSubmitting}
              >
                Hủy
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting || !form.formState.isDirty}
              >
                {isSubmitting ? "Đang gửi..." : "Gửi báo cáo"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

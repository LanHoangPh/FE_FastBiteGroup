"use client";

import React, { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Link, Copy, Clock, Users, Check, Loader2, Share } from "lucide-react";

import { createInviteLink } from "@/lib/api/customer/groups";
import { CreateInviteLinkDto } from "@/types/customer/group";
import { handleApiError } from "@/lib/utils/errorUtils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";

interface CreateInviteLinkModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  groupId: string;
  groupName: string;
}

export function CreateInviteLinkModal({
  isOpen,
  onOpenChange,
  groupId,
  groupName,
}: CreateInviteLinkModalProps) {
  const [expiresInHours, setExpiresInHours] = useState<string>("");
  const [maxUses, setMaxUses] = useState<string>("");
  const [generatedLink, setGeneratedLink] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [expiresError, setExpiresError] = useState<string | null>(null);
  const [maxUsesError, setMaxUsesError] = useState<string | null>(null);

  // Create invite link mutation
  const createLinkMutation = useMutation({
    mutationFn: (payload: CreateInviteLinkDto) =>
      createInviteLink(groupId, payload),
    onSuccess: (data) => {
      const fullLink = `${window.location.origin}/invite/${data.invitationCode}`;
      setGeneratedLink(fullLink);
      toast.success("Link mời đã được tạo thành công.");
    },
    onError: (error) => {
      handleApiError(error, "Không thể tạo link mời");
    },
  });

  const handleExpiresChange = (value: string) => {
    setExpiresInHours(value);

    // Validate that the value is not 0
    if (value === "0") {
      setExpiresError("Thời hạn phải lớn hơn 0 giờ");
    } else {
      setExpiresError(null);
    }
  };

  const handleMaxUsesChange = (value: string) => {
    setMaxUses(value);

    // Validate that the value is not 0
    if (value === "0") {
      setMaxUsesError("Số lần sử dụng phải lớn hơn 0");
    } else {
      setMaxUsesError(null);
    }
  };

  const handleGenerateLink = () => {
    // Check if there's an error before proceeding
    if (expiresInHours === "0") {
      setExpiresError("Thời hạn phải lớn hơn 0 giờ");
      return;
    }

    if (maxUses === "0") {
      setMaxUsesError("Số lần sử dụng phải lớn hơn 0");
      return;
    }

    const payload: CreateInviteLinkDto = {
      expiresInHours: expiresInHours ? parseInt(expiresInHours) : null,
      maxUses: maxUses ? parseInt(maxUses) : null,
    };
    createLinkMutation.mutate(payload);
  };

  const handleCopyLink = async () => {
    if (generatedLink) {
      try {
        await navigator.clipboard.writeText(generatedLink);
        setCopied(true);
        toast.success("Đã sao chép link vào clipboard");
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        toast.error("Không thể sao chép link");
      }
    }
  };

  const handleShareLink = async () => {
    if (generatedLink && navigator.share) {
      try {
        await navigator.share({
          title: `Tham gia nhóm ${groupName}`,
          text: `Bạn được mời tham gia nhóm ${groupName}`,
          url: generatedLink,
        });
      } catch (err) {
        // User cancelled or share not supported
        handleCopyLink();
      }
    } else {
      handleCopyLink();
    }
  };

  const handleClose = () => {
    onOpenChange(false);
    // Reset state when closing
    setTimeout(() => {
      setExpiresInHours("");
      setMaxUses("");
      setGeneratedLink(null);
      setCopied(false);
      setExpiresError(null);
      setMaxUsesError(null);
    }, 300);
  };

  // Check if form is valid
  const isFormValid =
    !expiresError &&
    !maxUsesError &&
    !(expiresInHours === "0") &&
    !(maxUses === "0");

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Link className="h-5 w-5 text-blue-500" />
            Tạo link mời nhóm
          </DialogTitle>
          <DialogDescription>
            Tạo link mời để chia sẻ với những người bạn muốn mời vào nhóm "
            {groupName}"
          </DialogDescription>
        </DialogHeader>

        {!generatedLink ? (
          // Form View
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="expires-hours" className="text-sm font-medium">
                Thời hạn (giờ)
              </Label>
              <div className="relative">
                <Clock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="expires-hours"
                  type="number"
                  placeholder="Không giới hạn"
                  value={expiresInHours}
                  onChange={(e) => handleExpiresChange(e.target.value)}
                  className={`pl-10 ${expiresError ? "border-red-500" : ""}`}
                  min="1"
                  max="8760"
                  minLength={1}
                  maxLength={4}
                />
              </div>
              {expiresError ? (
                <p className="text-xs text-red-500">{expiresError}</p>
              ) : (
                <p className="text-xs text-gray-500">
                  Để trống nếu không muốn giới hạn thời gian
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="max-uses" className="text-sm font-medium">
                Số lần sử dụng tối đa
              </Label>
              <div className="relative">
                <Users className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="max-uses"
                  type="number"
                  placeholder="Không giới hạn"
                  value={maxUses}
                  onChange={(e) => handleMaxUsesChange(e.target.value)}
                  className={`pl-10 ${maxUsesError ? "border-red-500" : ""}`}
                  min="1"
                  max="1000"
                  minLength={1}
                  maxLength={4}
                />
              </div>
              {maxUsesError ? (
                <p className="text-xs text-red-500">{maxUsesError}</p>
              ) : (
                <p className="text-xs text-gray-500">
                  Để trống nếu không muốn giới hạn số lần sử dụng
                </p>
              )}
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button variant="outline" onClick={handleClose}>
                Hủy
              </Button>
              <Button
                onClick={handleGenerateLink}
                disabled={createLinkMutation.isPending || !isFormValid}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                {createLinkMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Đang tạo...
                  </>
                ) : (
                  <>
                    <Link className="h-4 w-4 mr-2" />
                    Tạo link mời
                  </>
                )}
              </Button>
            </div>
          </div>
        ) : (
          // Generated Link View
          <div className="space-y-4">
            <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
              <div className="flex items-center gap-2 mb-2">
                <Check className="h-4 w-4 text-green-600" />
                <span className="text-sm font-medium text-green-700 dark:text-green-400">
                  Link mời đã được tạo thành công
                </span>
              </div>
              <p className="text-xs text-green-600 dark:text-green-500">
                Chia sẻ link này với những người bạn muốn mời vào nhóm
              </p>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium">Link mời của bạn:</Label>
              <div className="flex items-center gap-2 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border">
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-blue-600 dark:text-blue-400 font-mono truncate">
                    {generatedLink}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button variant="outline" onClick={handleClose}>
                Đóng
              </Button>
              <Button
                variant="outline"
                onClick={handleShareLink}
                className="flex items-center gap-2"
              >
                <Share className="h-4 w-4" />
                Chia sẻ
              </Button>
              <Button
                onClick={handleCopyLink}
                disabled={copied}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                {copied ? (
                  <>
                    <Check className="h-4 w-4 mr-2" />
                    Đã sao chép
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4 mr-2" />
                    Sao chép link
                  </>
                )}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

"use client";

import { Search } from "lucide-react";

import { ReportedContentType } from "@/types/customer/moderation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";

interface FilterControlsProps {
  contentType: ReportedContentType | null;
  onContentTypeChange: (value: ReportedContentType | null) => void;
  authorSearch: string;
  onAuthorSearchChange: (value: string) => void;
  reporterSearch: string;
  onReporterSearchChange: (value: string) => void;
  sortBy: "newest" | "oldest";
  onSortByChange: (value: "newest" | "oldest") => void;
}

export function FilterControls({
  contentType,
  onContentTypeChange,
  authorSearch,
  onAuthorSearchChange,
  reporterSearch,
  onReporterSearchChange,
  sortBy,
  onSortByChange,
}: FilterControlsProps) {
  const handleClearFilters = () => {
    onContentTypeChange(null);
    onAuthorSearchChange("");
    onReporterSearchChange("");
    onSortByChange("newest");
  };

  const hasActiveFilters = contentType || authorSearch || reporterSearch || sortBy !== "newest";

  return (
    <Card className="mb-6">
      <CardContent className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Content Type Filter */}
          <div className="space-y-2">
            <Label htmlFor="content-type">Loại nội dung</Label>
            <Select
              value={contentType || "all"}
              onValueChange={(value) =>
                onContentTypeChange(value === "all" ? null : (value as ReportedContentType))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Tất cả" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả</SelectItem>
                <SelectItem value={ReportedContentType.Post}>Bài viết</SelectItem>
                <SelectItem value={ReportedContentType.Comment}>Bình luận</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Sort By */}
          <div className="space-y-2">
            <Label htmlFor="sort-by">Sắp xếp theo</Label>
            <Select value={sortBy} onValueChange={(value) => onSortByChange(value as "newest" | "oldest")}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Mới nhất</SelectItem>
                <SelectItem value="oldest">Cũ nhất</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Author Search */}
          <div className="space-y-2">
            <Label htmlFor="author-search">Tìm theo tác giả</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                id="author-search"
                placeholder="Tên tác giả..."
                value={authorSearch}
                onChange={(e) => onAuthorSearchChange(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Reporter Search */}
          <div className="space-y-2">
            <Label htmlFor="reporter-search">Tìm theo người báo cáo</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                id="reporter-search"
                placeholder="Tên người báo cáo..."
                value={reporterSearch}
                onChange={(e) => onReporterSearchChange(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </div>

        {/* Clear Filters Button */}
        {hasActiveFilters && (
          <div className="mt-4 flex justify-end">
            <Button variant="outline" onClick={handleClearFilters}>
              Xóa bộ lọc
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

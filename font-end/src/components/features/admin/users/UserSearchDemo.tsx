"use client";

import { useState } from "react";
import { toast } from "sonner";
import { UserSearchCombobox } from "./UserSearchCombobox";
import { UserSearchResultDTO } from "@/types/admin/group.types";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";

export function UserSearchDemo() {
  const [selectedUser, setSelectedUser] = useState<UserSearchResultDTO | null>(
    null
  );
  const [selectedGroupUser, setSelectedGroupUser] =
    useState<UserSearchResultDTO | null>(null);
  const [searchQuery, setSearchQuery] = useState(""); // Add search query state for basic search
  const [groupSearchQuery, setGroupSearchQuery] = useState(""); // Add search query state for group search

  const handleUserSelect = (user: UserSearchResultDTO | null) => {
    if (user) {
      setSelectedUser(user);
      setSearchQuery(user.displayName); // Update search query when user is selected
      toast.success("Đã chọn người dùng", {
        description: `${user.displayName} (${user.email})`,
      });
    } else {
      setSearchQuery(""); // Clear search query when user is cleared
    }
  };

  const handleGroupUserSelect = (user: UserSearchResultDTO | null) => {
    if (user) {
      setSelectedGroupUser(user);
      setGroupSearchQuery(user.displayName); // Update search query when user is selected
      toast.success("Đã chọn người dùng cho nhóm", {
        description: `${user.displayName} (${user.email})`,
      });
    } else {
      setGroupSearchQuery(""); // Clear search query when user is cleared
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold">
          Enhanced User Search Component Demo
        </h1>
        <p className="text-muted-foreground mt-2">
          Demo component để kiểm tra các tính năng nâng cao của
          UserSearchCombobox
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Basic User Search */}
        <Card>
          <CardHeader>
            <CardTitle>Tìm kiếm người dùng cơ bản</CardTitle>
            <CardDescription>
              Tìm kiếm tất cả người dùng trong hệ thống với infinite scroll
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <UserSearchCombobox
              value={selectedUser} // Pass selectedUser as controlled value
              onSelectUser={handleUserSelect}
              searchQuery={searchQuery} // Pass searchQuery as controlled value
              onSearchQueryChange={setSearchQuery} // Pass setSearchQuery as callback
              placeholder="Tìm kiếm người dùng..."
            />

            {selectedUser && (
              <div className="p-4 border rounded-lg bg-muted/50">
                <h4 className="font-medium mb-2">Người dùng đã chọn:</h4>
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage
                      src={selectedUser.avatarUrl}
                      alt={selectedUser.displayName}
                    />
                    <AvatarFallback>
                      {selectedUser.displayName.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{selectedUser.displayName}</p>
                    <p className="text-sm text-muted-foreground">
                      {selectedUser.email}
                    </p>
                    <Badge variant="outline" className="mt-1">
                      ID: {selectedUser.userId.slice(0, 8)}...
                    </Badge>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Group User Search */}
        <Card>
          <CardHeader>
            <CardTitle>Tìm kiếm người dùng cho nhóm</CardTitle>
            <CardDescription>
              Tìm kiếm người dùng chưa có trong nhóm cụ thể với excludeGroupId
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <UserSearchCombobox
              value={selectedGroupUser} // Pass selectedGroupUser as controlled value
              onSelectUser={handleGroupUserSelect}
              searchQuery={groupSearchQuery} // Pass groupSearchQuery as controlled value
              onSearchQueryChange={setGroupSearchQuery} // Pass setGroupSearchQuery as callback
              excludeGroupId="sample-group-id-123"
              placeholder="Tìm kiếm người dùng cho nhóm..."
            />

            {selectedGroupUser && (
              <div className="p-4 border rounded-lg bg-muted/50">
                <h4 className="font-medium mb-2">
                  Người dùng đã chọn cho nhóm:
                </h4>
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage
                      src={selectedGroupUser.avatarUrl}
                      alt={selectedGroupUser.displayName}
                    />
                    <AvatarFallback>
                      {selectedGroupUser.displayName.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">
                      {selectedGroupUser.displayName}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {selectedGroupUser.email}
                    </p>
                    <Badge variant="secondary" className="mt-1">
                      Có thể thêm vào nhóm
                    </Badge>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* New Features Showcase */}
      <Card>
        <CardHeader>
          <CardTitle>✨ Tính năng mới được thêm vào</CardTitle>
          <CardDescription>
            Danh sách các tính năng nâng cao đã được implement
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Critical Fixes */}
            <div className="space-y-4">
              <h4 className="font-semibold text-lg text-primary">
                🔧 Critical Fixes & Must-Have Features
              </h4>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-success rounded-full mt-2 flex-shrink-0"></div>
                  <div>
                    <p className="font-medium">Infinite Scroll Pagination</p>
                    <p className="text-sm text-muted-foreground">
                      Sử dụng useInfiniteQuery để tải dữ liệu theo trang khi
                      scroll
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-success rounded-full mt-2 flex-shrink-0"></div>
                  <div>
                    <p className="font-medium">Robust API Error Handling</p>
                    <p className="text-sm text-muted-foreground">
                      Xử lý lỗi API với thông báo thân thiện và nút retry
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-success rounded-full mt-2 flex-shrink-0"></div>
                  <div>
                    <p className="font-medium">Proper Loading States</p>
                    <p className="text-sm text-muted-foreground">
                      Skeleton loader cho trạng thái loading ban đầu
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* UX Improvements */}
            <div className="space-y-4">
              <h4 className="font-semibold text-lg text-primary">
                🚀 UX & Optimization Improvements
              </h4>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-success rounded-full mt-2 flex-shrink-0"></div>
                  <div>
                    <p className="font-medium">Initial Results on Focus</p>
                    <p className="text-sm text-muted-foreground">
                      Tải danh sách người dùng ban đầu khi mở combobox
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-success rounded-full mt-2 flex-shrink-0"></div>
                  <div>
                    <p className="font-medium">Optimized Search Triggers</p>
                    <p className="text-sm text-muted-foreground">
                      Chỉ tìm kiếm khi nhập từ 2 ký tự trở lên
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-success rounded-full mt-2 flex-shrink-0"></div>
                  <div>
                    <p className="font-medium">Defensive Data Handling</p>
                    <p className="text-sm text-muted-foreground">
                      Loại bỏ duplicate và kiểm tra tính toàn vẹn dữ liệu
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <Separator className="my-6" />

          {/* Advanced Features */}
          <div className="space-y-4">
            <h4 className="font-semibold text-lg text-primary">
              🎯 Advanced Performance & Accessibility
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-success rounded-full mt-2 flex-shrink-0"></div>
                  <div>
                    <p className="font-medium">Scroll-based Infinite Loading</p>
                    <p className="text-sm text-muted-foreground">
                      Tự động tải trang tiếp theo khi scroll đến cuối
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-success rounded-full mt-2 flex-shrink-0"></div>
                  <div>
                    <p className="font-medium">Enhanced Accessibility</p>
                    <p className="text-sm text-muted-foreground">
                      ARIA labels, keyboard navigation, và screen reader support
                    </p>
                  </div>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-success rounded-full mt-2 flex-shrink-0"></div>
                  <div>
                    <p className="font-medium">Performance Optimizations</p>
                    <p className="text-sm text-muted-foreground">
                      useCallback, useMemo, và debounced search để tối ưu hiệu
                      suất
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-success rounded-full mt-2 flex-shrink-0"></div>
                  <div>
                    <p className="font-medium">Smart State Management</p>
                    <p className="text-sm text-muted-foreground">
                      Quản lý state thông minh với retry logic và cache
                      management
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Usage Instructions */}
      <Card>
        <CardHeader>
          <CardTitle>Cách sử dụng component nâng cao</CardTitle>
          <CardDescription>
            Hướng dẫn tích hợp UserSearchCombobox với các tính năng mới
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h4 className="font-medium mb-2">1. Import component:</h4>
              <pre className="bg-muted p-3 rounded text-sm overflow-x-auto">
                {`import { UserSearchCombobox } from "@/components/features/admin/users/UserSearchCombobox";`}
              </pre>
            </div>

            <div>
              <h4 className="font-medium mb-2">
                2. Sử dụng cơ bản với infinite scroll:
              </h4>
              <pre className="bg-muted p-3 rounded text-sm overflow-x-auto">
                {`const [selectedUser, setSelectedUser] = useState(null);
const [searchQuery, setSearchQuery] = useState("");

<UserSearchCombobox
  value={selectedUser}
  onSelectUser={setSelectedUser}
  searchQuery={searchQuery}
  onSearchQueryChange={setSearchQuery}
  placeholder="Tìm kiếm người dùng..."
/>`}
              </pre>
            </div>

            <div>
              <h4 className="font-medium mb-2">
                3. Với excludeGroupId và error handling:
              </h4>
              <pre className="bg-muted p-3 rounded text-sm overflow-x-auto">
                {`const [selectedUser, setSelectedUser] = useState(null);
const [searchQuery, setSearchQuery] = useState("");

<UserSearchCombobox
  value={selectedUser}
  onSelectUser={setSelectedUser}
  searchQuery={searchQuery}
  onSearchQueryChange={setSearchQuery}
  excludeGroupId="group-id-123"
  placeholder="Tìm kiếm người dùng cho nhóm..."
/>`}
              </pre>
            </div>

            <div>
              <h4 className="font-medium mb-2">4. Props available:</h4>
              <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                <li>
                  <code>value</code>: Người dùng đã chọn (controlled)
                </li>
                <li>
                  <code>onSelectUser</code>: Callback khi chọn người dùng
                  (required)
                </li>
                <li>
                  <code>searchQuery</code>: Text tìm kiếm hiện tại (controlled)
                </li>
                <li>
                  <code>onSearchQueryChange</code>: Callback khi text tìm kiếm
                  thay đổi (required)
                </li>
                <li>
                  <code>excludeGroupId</code>: ID nhóm để loại trừ thành viên
                  hiện tại (optional)
                </li>
                <li>
                  <code>placeholder</code>: Placeholder text cho input
                  (optional)
                </li>
                <li>
                  <code>className</code>: CSS classes tùy chỉnh (optional)
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-medium mb-2">5. Tính năng tự động:</h4>
              <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                <li>
                  Infinite scroll pagination khi scroll đến cuối danh sách
                </li>
                <li>Error handling với retry mechanism</li>
                <li>Skeleton loading cho trạng thái ban đầu</li>
                <li>Debounced search (300ms delay)</li>
                <li>Initial results khi mở combobox</li>
                <li>Duplicate removal và data validation</li>
                <li>
                  Fully controlled component với state management ở parent
                </li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

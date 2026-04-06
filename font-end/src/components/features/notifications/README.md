# 🔔 Notification Center System

A complete notification center implementation for FastBite Group TeamChat platform.

## 📋 Components Overview

### 1. **NotificationBell** - Main Trigger Component
- Bell icon with unread count badge
- Integrated with Shadcn/UI Popover
- Responsive design with accessibility support

### 2. **NotificationList** - Notification Feed
- Infinite scroll with pagination
- "Mark all as read" functionality
- Empty states and error handling
- Vietnamese localization

### 3. **NotificationItem** - Individual Notification
- 16 different notification type icons
- Click to navigate and mark as read
- Visual indicators for unread status
- Relative timestamps in Vietnamese

## 🚀 Usage

### Basic Integration
```tsx
import { NotificationBell } from "@/components/features/notifications/NotificationBell";

// In your header/sidebar component:
<NotificationBell />
```

### With Custom Styling
```tsx
<NotificationBell className="custom-bell-styles" />
```

## 🎯 Features

✅ **Real-time Updates** - SignalR integration
✅ **Infinite Scroll** - Smooth pagination
✅ **Mark as Read** - Individual and bulk actions
✅ **Navigation** - Click to go to related content
✅ **Vietnamese UI** - Fully localized
✅ **Responsive Design** - Works on all devices
✅ **Accessibility** - ARIA labels and keyboard support
✅ **Error Handling** - Graceful fallbacks
✅ **Loading States** - Skeleton screens and spinners

## 🔧 API Integration

The system uses three main API endpoints:

1. `GET /notifications/me` - Fetch paginated notifications
2. `POST /notifications/{id}/mark-as-read` - Mark single notification as read
3. `POST /notifications/me/mark-all-as-read` - Mark all notifications as read

## 🎨 Notification Types & Icons

| Type | Icon | Color |
|------|------|-------|
| NewMessage | MessageCircle | Blue |
| UserAddedToGroup | UserPlus | Green |
| UserMention | AtSign | Purple |
| NewPostInGroup | FileText | Indigo |
| PostLike | Heart | Red |
| VideoCallInvitation | Video | Green |
| SystemAnnouncement | Megaphone | Indigo |
| ... and 9 more types | | |

## 📱 Responsive Behavior

- **Desktop**: Popover opens to the right of the bell
- **Mobile**: Popover adjusts position automatically
- **Touch**: Optimized for touch interactions

## 🔄 State Management

- **Global State**: NotificationProvider with SignalR
- **Local State**: React Query for caching and pagination
- **Optimistic Updates**: Immediate UI feedback

## 🌐 Localization

All text is in Vietnamese:
- "Thông báo" (Notifications)
- "Đánh dấu tất cả đã đọc" (Mark all as read)
- "Xem thêm" (Load more)
- Relative timestamps in Vietnamese

## 🔧 Customization

### Custom Bell Icon
```tsx
<NotificationBell className="h-8 w-8 text-custom-color" />
```

### Custom Popover Size
```tsx
// Edit NotificationBell.tsx
<PopoverContent className="w-80"> // Change from w-96
```

### Custom Notification Item
```tsx
// Extend NotificationItem component
// Add custom styling or behavior
```

## 🐛 Troubleshooting

### No notifications showing
1. Check NotificationProvider is wrapped around your app
2. Verify API endpoints are working
3. Check user authentication and roles

### SignalR not connecting
1. Check NEXT_PUBLIC_API_URL environment variable
2. Verify user has Customer or VIP role
3. Check network connectivity

### Styling issues
1. Ensure Tailwind CSS classes are available
2. Check dark mode compatibility
3. Verify Shadcn/UI components are installed

## 📦 Dependencies

- `@tanstack/react-query` - Data fetching and caching
- `@microsoft/signalr` - Real-time updates
- `lucide-react` - Icons
- `date-fns` - Date formatting
- `sonner` - Toast notifications
- `shadcn/ui` - UI components

## 🎉 Ready to Use!

The notification center is now fully integrated and ready to use. Users will see:

1. **Bell icon** in the sidebar with unread count
2. **Rich notifications** when clicking the bell
3. **Real-time updates** when new notifications arrive
4. **Smooth interactions** with mark as read functionality

Enjoy your new professional notification system! 🚀

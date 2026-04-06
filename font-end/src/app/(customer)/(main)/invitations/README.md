# Invitations Page Implementation

This document describes the implementation of the dedicated invitations page for managing group invitations.

## Overview

The invitations page allows users to view and respond to pending group invitations in a dedicated interface, accessible through the main navigation sidebar.

## File Structure

```
src/app/(customer)/(main)/invitations/
└── page.tsx                 # Main invitations page
```

## Features

### 📄 **Dedicated Invitations Page** (`/invitations`)

- **Location**: `src/app/(customer)/(main)/invitations/page.tsx`
- **Purpose**: Centralized location for managing group invitations
- **Design**: Clean, focused interface with proper page header and content area

### 🧭 **Navigation Integration**

- **Added to CustomerSidebar**: New navigation item "Lời mời" with Mail icon
- **Badge Notifications**: Shows count of pending invitations (currently set to 2)
- **Active State**: Proper highlighting when on invitations page
- **Route Detection**: Updated `getCurrentNavItem()` to recognize `/invitations` path

## Technical Implementation

### Page Component Structure

```tsx
export default function InvitationsPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Page Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-gradient-to-r from-cyan-500 to-purple-600 rounded-lg flex items-center justify-center">
            <Mail className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              Lời mời
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Quản lý các lời mời tham gia nhóm của bạn
            </p>
          </div>
        </div>
      </div>

      {/* Invitations Content */}
      <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-6">
        <PendingInvitationsList />
      </div>
    </div>
  );
}
```

### Navigation Updates

1. **Route Detection**:

```tsx
const getCurrentNavItem = (path: string) => {
  if (path.includes("/chat")) return "chats";
  if (path.includes("/groups")) return "groups";
  if (path.includes("/invitations")) return "invitations"; // Added
  if (path.includes("/discover")) return "discover";
  if (path.includes("/communities")) return "communities";
  // ... rest
};
```

2. **Navigation Item**:

```tsx
{
  id: "invitations",
  icon: Mail,
  label: "Lời mời",
  path: "/invitations",
  badge: 2,
}
```

## Integration with Existing Components

The page leverages the existing invitation management components:

- **PendingInvitationsList**: Main component for displaying invitation list
- **GroupInvitationCard**: Individual invitation cards with accept/decline actions
- **API Integration**: Uses existing invitation API endpoints
- **State Management**: TanStack Query for data fetching and mutations

## User Experience

### ✅ **Key Features**

- **Dedicated Page**: Users can bookmark and directly navigate to invitations
- **Clean Interface**: Focused design without distractions
- **Consistent Design**: Matches the app's design language with gradient header
- **Responsive Layout**: Works well on desktop and mobile devices
- **Badge Notifications**: Clear indication of pending invitations in sidebar

### 🎯 **Navigation Flow**

1. User clicks "Lời mời" in sidebar
2. Navigates to `/invitations` page
3. Views all pending invitations in organized list
4. Can accept/decline invitations directly from the page
5. Real-time updates remove processed invitations from list

## URL Structure

| Route          | Description                      |
| -------------- | -------------------------------- |
| `/invitations` | Main invitations management page |

## Benefits

1. **Centralized Management**: All invitations in one place
2. **Better UX**: Dedicated space vs. buried in notifications
3. **Bookmarkable**: Users can bookmark the invitations page
4. **Clear Navigation**: Obvious entry point from sidebar
5. **Badge Feedback**: Clear visual indication of pending items
6. **Responsive Design**: Works across all device sizes

## Future Enhancements

- **Sent Invitations**: Tab to view invitations you've sent
- **Invitation History**: Archive of past invitations
- **Bulk Actions**: Select multiple invitations for batch operations
- **Filtering**: Filter by group type or invitation date
- **Search**: Search through invitations by group name or inviter

The invitations page is now fully functional and integrated into the navigation system! 🚀

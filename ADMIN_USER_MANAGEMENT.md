# Admin User Management

This document describes the new user management features added to the admin panel.

## Features

### 1. User List View
- **Location**: Admin Panel → Users Tab
- **Features**:
  - View all user accounts in a paginated table
  - Search users by name or email
  - Filter by user role (Admin/User)
  - Sort by various columns (role, credits, images generated, join date)
  - Real-time user statistics

### 2. User Information Displayed
- User avatar and basic info (name, email)
- User role with visual indicators
- Credit balance
- Number of images generated
- Account creation date
- Subscription status (Active/Expired/None)

### 3. Real-time Statistics
- **Location**: Admin Panel → Overview Tab
- **Metrics**:
  - Total users with growth percentage
  - Total images generated across all users
  - Active subscription count and conversion rate
  - Admin user count and percentage

## API Endpoints

### GET `/api/admin/users`
Fetches paginated user list with filtering and sorting.

**Query Parameters**:
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10)
- `search`: Search term for name/email
- `role`: Filter by role (ADMIN/USER)
- `sortBy`: Sort field (createdAt, role, credits, etc.)
- `sortOrder`: Sort direction (asc/desc)

**Response**:
```json
{
  "users": [...],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 100,
    "totalPages": 10
  }
}
```

### GET `/api/admin/stats`
Fetches real-time admin statistics.

**Response**:
```json
{
  "totalUsers": 100,
  "totalAdmins": 5,
  "totalImages": 1500,
  "activeSubscriptions": 25,
  "newUsersThisMonth": 10,
  "userGrowth": 12.5
}
```

### PATCH `/api/admin/users/[id]`
Updates user information (role, credits).

**Request Body**:
```json
{
  "role": "ADMIN",
  "credits": 100
}
```

### DELETE `/api/admin/users/[id]`
Deletes a user account (cannot delete own account).

## Security

- All endpoints require admin authentication
- Role-based access control enforced
- Input validation on all endpoints
- Protection against self-deletion

## Components

### `UsersList` (`components/dashboard/users-list.tsx`)
Main component for displaying and managing users.

### `AdminStats` (`components/dashboard/admin-stats.tsx`)
Component for displaying real-time statistics.

## Usage

1. Navigate to the admin panel
2. Click on the "Users" tab to view all users
3. Use search and filters to find specific users
4. View real-time statistics in the "Overview" tab

## Future Enhancements

- User editing capabilities (inline editing)
- Bulk operations (delete multiple users, update roles)
- User activity logs
- Export user data
- User impersonation for support 
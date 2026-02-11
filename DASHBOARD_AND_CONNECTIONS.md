# Dashboard and Connections Documentation

This document details what is connected to the Dashboard and all related API endpoints used in the HHD App.

---

## Dashboard Overview

The **Dashboard** is a UI component that appears in multiple screens throughout the application, displaying user statistics and performance metrics in real-time.

### Dashboard Locations

The Dashboard card appears in the following screens:
1. **HomeScreen** (`src/components/HomeScreen.tsx`)
2. **OrderReceivedScreen** (`src/components/OrderReceivedScreen.tsx`)

---

## Dashboard Components & Connections

### Dashboard UI Elements

The Dashboard displays:
- **User Information:**
  - User name (from profile or auth context)
  - Target orders (currently hardcoded as "50 orders")
  
- **Statistics:**
  - Today's completed orders count
  - Performance percentage (currently hardcoded as "100%")
  - Average time (currently hardcoded as "42s avg")

### Connected Services

The Dashboard connects to the following services:

#### 1. **Statistics Service** (`src/services/statistics.service.ts`)
- **Purpose:** Calculates and provides statistics about orders and performance
- **Methods Used:**
  - `getTodayCompletedOrdersCount()` - Gets count of orders completed today
  - `getTaskStatistics()` - Gets comprehensive task statistics (used in TasksScreen)

#### 2. **Auth Service** (`src/services/auth.service.ts`)
- **Purpose:** Handles user authentication and profile data
- **Methods Used:**
  - `getProfile()` - Fetches user profile information
  - `getMe()` - Gets current authenticated user (used internally by statistics service)

#### 3. **Order Service** (`src/services/order.service.ts`)
- **Purpose:** Handles order-related API operations
- **Methods Used (via Statistics Service):**
  - `getCompletedOrders()` - Fetches all completed orders from Completed Orders table

#### 4. **Scanned Item Service** (`src/services/scannedItem.service.ts`)
- **Purpose:** Handles scanned item records
- **Methods Used (via Statistics Service):**
  - `getScannedItems()` - Gets scanned items with filters (userId, date range, etc.)

---

## API Endpoints Used by Dashboard

### Direct API Calls

#### User Profile Endpoint
- **GET** `/api/users/profile`
  - **Service:** `authService.getProfile()`
  - **Purpose:** Fetches user profile data (name, deviceId, etc.)
  - **Authentication:** Required (Protected)
  - **Used In:** HomeScreen, OrderReceivedScreen
  - **Frequency:** Once on component mount, when authentication state changes

#### Completed Orders Endpoint
- **GET** `/api/orders/completed`
  - **Service:** `orderService.getCompletedOrders()` (called via `statisticsService`)
  - **Purpose:** Fetches all completed orders from Completed Orders table
  - **Authentication:** Required (Protected)
  - **Used In:** Statistics calculations
  - **Frequency:** Every 10 seconds (cached for 10 seconds to prevent excessive calls)

#### Current User Endpoint
- **GET** `/api/auth/me`
  - **Service:** `authService.getMe()` (called internally by statistics service)
  - **Purpose:** Gets current authenticated user ID for filtering statistics
  - **Authentication:** Required (Protected)
  - **Used In:** Statistics service to filter data by logged-in user

#### Scanned Items Endpoint
- **GET** `/api/scanned-items`
  - **Service:** `scannedItemService.getScannedItems()`
  - **Purpose:** Gets scanned items filtered by userId and date range
  - **Authentication:** Required (Protected)
  - **Query Parameters:**
    - `userId` - Filter by user ID
    - `startDate` - Start date (ISO format)
    - `endDate` - End date (ISO format)
    - `limit` - Maximum items to return (default: 1000)
  - **Used In:** Statistics calculations for accuracy and activity metrics

---

## Dashboard Data Flow

### HomeScreen Dashboard Flow

```
1. Component Mounts
   ↓
2. Check Authentication Status
   ↓
3. Fetch User Profile (GET /api/users/profile)
   ↓
4. Fetch Today's Completed Count (via statisticsService)
   ├─→ GET /api/orders/completed
   └─→ Filter by today's date range
   ↓
5. Display Dashboard Card with:
   - User name from profile
   - Today's completed count
   - Hardcoded performance metrics
   ↓
6. Auto-refresh every 30 seconds
```

### OrderReceivedScreen Dashboard Flow

```
1. Component Mounts
   ↓
2. Check Authentication Status
   ↓
3. Fetch User Profile (GET /api/users/profile)
   ↓
4. Fetch Pending Orders (GET /api/orders/status/pending)
   ↓
5. Fetch Today's Completed Count (via statisticsService)
   ├─→ GET /api/orders/completed
   └─→ Filter by today's date range
   ↓
6. Display Dashboard Card + Order List
   ↓
7. Auto-refresh every 30 seconds
```

---

## Tasks Screen (Related Statistics)

The **TasksScreen** (`src/components/TasksScreen.tsx`) displays comprehensive statistics that are related to dashboard functionality:

### Tasks Screen Statistics

#### Performance Metrics
- **Orders Completed** - Count of orders completed today
- **Average Pick Time** - Average time to complete an order
- **Accuracy** - Percentage of correctly scanned items
- **SLA Compliance** - Percentage of orders completed within target time

#### Today's Activity
- **Items Picked** - Total items scanned today
- **Active Time** - Total time spent on picking activities
- **Efficiency Rate** - Performance efficiency percentage

### Tasks Screen API Endpoints

The TasksScreen uses the same endpoints as Dashboard, plus:

- **GET** `/api/orders/completed` - For calculating orders completed
- **GET** `/api/scanned-items` - For calculating accuracy and items picked
- **GET** `/api/auth/me` - For filtering by current user

**Refresh Frequency:** Every 10 seconds

---

## Pacman Component

**Status:** ❌ **Not Found**

After comprehensive search of the codebase, no component, service, or feature named "Pacman" was found. This could mean:
- The feature doesn't exist yet
- It might be referenced by a different name
- It could be a planned feature not yet implemented

If "Pacman" refers to a specific feature or component, please provide additional context for accurate documentation.

---

## Complete API Endpoints Reference

### All API Endpoints in the System

#### Health Check
- **GET** `/health` - Health check (no authentication required)

#### Authentication Endpoints
- **POST** `/api/auth/send-otp` - Send OTP to mobile number
- **POST** `/api/auth/verify-otp` - Verify OTP and login
- **GET** `/api/auth/me` - Get current user (Protected)
- **POST** `/api/auth/logout` - Logout (Protected)

#### Order Endpoints
- **GET** `/api/orders` - Get all orders (Protected)
- **POST** `/api/orders` - Create new order (Protected)
- **GET** `/api/orders/status/:status` - Get orders by status (Protected)
- **GET** `/api/orders/completed` - Get completed orders (Protected) ⭐ **Used by Dashboard**
- **GET** `/api/orders/assignorders/status/:status` - Get assignorders by status (Protected)
- **PUT** `/api/orders/assignorders/:orderId/status` - Update assignorder status (Protected)
- **GET** `/api/orders/:orderId` - Get single order (Protected)
- **PUT** `/api/orders/:orderId/status` - Update order status (Protected)

#### Bag Endpoints
- **POST** `/api/bags/scan` - Scan bag (Protected)
- **GET** `/api/bags/:bagId` - Get bag details (Protected)
- **PUT** `/api/bags/:bagId` - Update bag (Protected)

#### Item Endpoints
- **GET** `/api/items/order/:orderId` - Get order items (Protected)
- **POST** `/api/items/scan` - Scan item (Protected)
- **PUT** `/api/items/:itemId/not-found` - Mark item as not found (Protected)
- **PUT** `/api/items/:itemId` - Update item (Protected)

#### Rack Endpoints
- **POST** `/api/racks/scan` - Scan rack QR (Protected)
- **GET** `/api/racks/available` - Get available racks (Protected)
- **GET** `/api/racks/:rackCode` - Get rack details (Protected)

#### Task Endpoints
- **GET** `/api/tasks` - Get all tasks (Protected)
- **POST** `/api/tasks` - Create new task (Protected)
- **PUT** `/api/tasks/:taskId` - Update task (Protected)
- **DELETE** `/api/tasks/:taskId` - Delete task (Protected)

#### Photo Endpoints
- **POST** `/api/photos` - Upload photo (Protected, multipart/form-data)
- **GET** `/api/photos/order/:orderId/bag/:bagId` - Get photo by order and bag (Protected)
- **PUT** `/api/photos/:photoId/verify` - Verify photo (Protected)

#### User Endpoints
- **GET** `/api/users/profile` - Get user profile (Protected) ⭐ **Used by Dashboard**
- **PUT** `/api/users/profile` - Update user profile (Protected)

#### Scanned Item Endpoints
- **POST** `/api/scanned-items` - Create scanned item record (Protected)
- **GET** `/api/scanned-items` - Get scanned items (Protected) ⭐ **Used by Dashboard**
- **GET** `/api/scanned-items/:id` - Get scanned item by ID (Protected)

---

## Summary

### Dashboard Connections Summary

| Component | Service | API Endpoint | Purpose |
|-----------|---------|--------------|---------|
| Dashboard | `authService` | `GET /api/users/profile` | Get user profile data |
| Dashboard | `statisticsService` | `GET /api/orders/completed` | Get completed orders count |
| Dashboard | `statisticsService` | `GET /api/auth/me` | Get current user ID |
| Dashboard | `statisticsService` | `GET /api/scanned-items` | Get scanned items for statistics |

### Total API Endpoints: **35**

### Dashboard-Specific Endpoints: **4**
1. `GET /api/users/profile`
2. `GET /api/orders/completed`
3. `GET /api/auth/me`
4. `GET /api/scanned-items`

### Refresh Intervals
- **HomeScreen Dashboard:** Every 30 seconds
- **OrderReceivedScreen Dashboard:** Every 30 seconds
- **TasksScreen Statistics:** Every 10 seconds

### Caching Strategy
- Completed orders are cached for 10 seconds to prevent excessive API calls
- Statistics service implements intelligent caching to optimize performance

---

## Notes

- All dashboard endpoints require authentication (JWT token)
- The dashboard uses React hooks (`useEffect`) for data fetching and auto-refresh
- Error handling is implemented with fallback to default values
- The statistics service filters data by the current logged-in user automatically
- All API calls go through the `apiService` layer which handles authentication headers automatically

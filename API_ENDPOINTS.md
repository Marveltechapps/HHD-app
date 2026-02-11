# API Endpoints Documentation

This document lists all API endpoints available in the HHD App Backend.

**Base URL:** `/api` (except health check)

**Total Endpoints:** 35

---

## Health Check

### GET `/health`
- **Description:** Health check endpoint to verify server and database status
- **Authentication:** Not required
- **Response:** Server status, database connection status, uptime

---

## Authentication Endpoints (`/api/auth`)

### POST `/api/auth/send-otp`
- **Description:** Send OTP to mobile number
- **Authentication:** Not required
- **Method:** POST

### POST `/api/auth/verify-otp`
- **Description:** Verify OTP and login
- **Authentication:** Not required
- **Method:** POST

### GET `/api/auth/me`
- **Description:** Get current authenticated user information
- **Authentication:** Required (Protected)
- **Method:** GET

### POST `/api/auth/logout`
- **Description:** Logout current user
- **Authentication:** Required (Protected)
- **Method:** POST

---

## Order Endpoints (`/api/orders`)

### GET `/api/orders`
- **Description:** Get all orders
- **Authentication:** Required (Protected)
- **Method:** GET

### POST `/api/orders`
- **Description:** Create a new order
- **Authentication:** Required (Protected)
- **Method:** POST

### GET `/api/orders/status/:status`
- **Description:** Get orders filtered by status
- **Authentication:** Required (Protected)
- **Method:** GET
- **Parameters:** `status` (path parameter)

### GET `/api/orders/completed`
- **Description:** Get all completed orders
- **Authentication:** Required (Protected)
- **Method:** GET

### GET `/api/orders/assignorders/status/:status`
- **Description:** Get assigned orders filtered by status
- **Authentication:** Required (Protected)
- **Method:** GET
- **Parameters:** `status` (path parameter)

### PUT `/api/orders/assignorders/:orderId/status`
- **Description:** Update status of an assigned order
- **Authentication:** Required (Protected)
- **Method:** PUT
- **Parameters:** `orderId` (path parameter)

### GET `/api/orders/:orderId`
- **Description:** Get a single order by ID
- **Authentication:** Required (Protected)
- **Method:** GET
- **Parameters:** `orderId` (path parameter)

### PUT `/api/orders/:orderId/status`
- **Description:** Update order status
- **Authentication:** Required (Protected)
- **Method:** PUT
- **Parameters:** `orderId` (path parameter)

---

## Bag Endpoints (`/api/bags`)

### POST `/api/bags/scan`
- **Description:** Scan a bag
- **Authentication:** Required (Protected)
- **Method:** POST

### GET `/api/bags/:bagId`
- **Description:** Get bag details by ID
- **Authentication:** Required (Protected)
- **Method:** GET
- **Parameters:** `bagId` (path parameter)

### PUT `/api/bags/:bagId`
- **Description:** Update bag information
- **Authentication:** Required (Protected)
- **Method:** PUT
- **Parameters:** `bagId` (path parameter)

---

## Item Endpoints (`/api/items`)

### GET `/api/items/order/:orderId`
- **Description:** Get all items for a specific order
- **Authentication:** Required (Protected)
- **Method:** GET
- **Parameters:** `orderId` (path parameter)

### POST `/api/items/scan`
- **Description:** Scan an item
- **Authentication:** Required (Protected)
- **Method:** POST

### PUT `/api/items/:itemId/not-found`
- **Description:** Mark an item as not found
- **Authentication:** Required (Protected)
- **Method:** PUT
- **Parameters:** `itemId` (path parameter)

### PUT `/api/items/:itemId`
- **Description:** Update item information
- **Authentication:** Required (Protected)
- **Method:** PUT
- **Parameters:** `itemId` (path parameter)

---

## Rack Endpoints (`/api/racks`)

### POST `/api/racks/scan`
- **Description:** Scan a rack QR code
- **Authentication:** Required (Protected)
- **Method:** POST

### GET `/api/racks/available`
- **Description:** Get all available racks
- **Authentication:** Required (Protected)
- **Method:** GET

### GET `/api/racks/:rackCode`
- **Description:** Get rack details by code
- **Authentication:** Required (Protected)
- **Method:** GET
- **Parameters:** `rackCode` (path parameter)

---

## Task Endpoints (`/api/tasks`)

### GET `/api/tasks`
- **Description:** Get all tasks
- **Authentication:** Required (Protected)
- **Method:** GET

### POST `/api/tasks`
- **Description:** Create a new task
- **Authentication:** Required (Protected)
- **Method:** POST

### PUT `/api/tasks/:taskId`
- **Description:** Update a task
- **Authentication:** Required (Protected)
- **Method:** PUT
- **Parameters:** `taskId` (path parameter)

### DELETE `/api/tasks/:taskId`
- **Description:** Delete a task
- **Authentication:** Required (Protected)
- **Method:** DELETE
- **Parameters:** `taskId` (path parameter)

---

## Photo Endpoints (`/api/photos`)

### POST `/api/photos`
- **Description:** Upload a photo
- **Authentication:** Required (Protected)
- **Method:** POST
- **Content-Type:** multipart/form-data
- **Body:** `photo` (file upload)

### GET `/api/photos/order/:orderId/bag/:bagId`
- **Description:** Get photo for a specific order and bag
- **Authentication:** Required (Protected)
- **Method:** GET
- **Parameters:** `orderId`, `bagId` (path parameters)

### PUT `/api/photos/:photoId/verify`
- **Description:** Verify a photo
- **Authentication:** Required (Protected)
- **Method:** PUT
- **Parameters:** `photoId` (path parameter)

---

## User Endpoints (`/api/users`)

### GET `/api/users/profile`
- **Description:** Get user profile
- **Authentication:** Required (Protected)
- **Method:** GET

### PUT `/api/users/profile`
- **Description:** Update user profile
- **Authentication:** Required (Protected)
- **Method:** PUT

---

## Scanned Item Endpoints (`/api/scanned-items`)

### POST `/api/scanned-items`
- **Description:** Create a new scanned item record
- **Authentication:** Required (Protected)
- **Method:** POST

### GET `/api/scanned-items`
- **Description:** Get all scanned items
- **Authentication:** Required (Protected)
- **Method:** GET

### GET `/api/scanned-items/:id`
- **Description:** Get a specific scanned item by ID
- **Authentication:** Required (Protected)
- **Method:** GET
- **Parameters:** `id` (path parameter)

---

## Summary

### Endpoint Count by Category:
- **Health Check:** 1 endpoint
- **Authentication:** 4 endpoints
- **Orders:** 8 endpoints
- **Bags:** 3 endpoints
- **Items:** 4 endpoints
- **Racks:** 3 endpoints
- **Tasks:** 4 endpoints
- **Photos:** 3 endpoints
- **Users:** 2 endpoints
- **Scanned Items:** 3 endpoints

### Total: **35 API Endpoints**

### Authentication Status:
- **Public Endpoints (No Auth Required):** 3
  - GET `/health`
  - POST `/api/auth/send-otp`
  - POST `/api/auth/verify-otp`
- **Protected Endpoints (Auth Required):** 32

---

## Notes

- All endpoints under `/api/*` are rate-limited (200 requests per 15 minutes by default)
- The health check endpoint (`/health`) is not rate-limited
- Most endpoints require authentication via JWT token (sent in Authorization header)
- File uploads are supported for photo endpoints (max 10MB)
- Static files (uploads) are served from `/uploads` path

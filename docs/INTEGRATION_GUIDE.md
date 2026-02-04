# Frontend-Backend Integration Guide

This guide explains how the frontend and backend are integrated and how to use the API services.

## Overview

The integration includes:
- **API Service Layer**: Centralized HTTP client with authentication
- **Auth Context**: React context for authentication state management
- **Service Modules**: Individual services for each API resource (auth, orders, bags, items, racks, tasks, photos)
- **Token Management**: Automatic token storage and refresh using AsyncStorage

## Architecture

```
src/
├── config/
│   └── api.ts              # API base URL and endpoint configuration
├── services/
│   ├── api.service.ts      # Base HTTP client with auth
│   ├── auth.service.ts     # Authentication service
│   ├── order.service.ts    # Order service
│   ├── bag.service.ts      # Bag service
│   ├── item.service.ts     # Item service
│   ├── rack.service.ts     # Rack service
│   ├── task.service.ts     # Task service
│   ├── photo.service.ts    # Photo service
│   └── index.ts            # Service exports
└── contexts/
    └── AuthContext.tsx    # Authentication context provider
```

## Setup

### 1. Backend Configuration

The backend CORS is configured to allow all origins in development mode for React Native/Expo compatibility.

**File**: `HHD-APP-Backend/src/app.ts`

```typescript
// CORS allows all origins in development
origin: process.env.NODE_ENV === 'production' 
  ? (process.env.CORS_ORIGIN?.split(',') || ['http://localhost:3000'])
  : true, // Allow all in development
```

### 2. Frontend API Configuration

**File**: `src/config/api.ts`

Update the base URL based on your environment:

- **Android Emulator**: Uses `http://10.0.2.2:5000/api` (automatically detected)
- **iOS Simulator**: Uses `http://localhost:5000/api`
- **Physical Device**: Replace with your computer's IP address
- **Production**: Update with your production backend URL

### 3. Environment Variables

Ensure your backend `.env` file is configured:

```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/hhd-app
JWT_SECRET=your-secret-key
CORS_ORIGIN=http://localhost:3000,http://localhost:19006
```

## Usage

### Authentication

The app uses OTP-based authentication. The `AuthContext` provides authentication state and methods:

```typescript
import { useAuth } from '../contexts/AuthContext';

function MyComponent() {
  const { user, isAuthenticated, login, sendOTP, logout } = useAuth();
  
  // Send OTP
  await sendOTP('9876543210');
  
  // Verify OTP and login
  await login('9876543210', '1234');
  
  // Logout
  await logout();
}
```

### API Services

All services follow a consistent pattern:

```typescript
import { orderService } from '../services';

// Get orders
const { orders, count, total } = await orderService.getOrders({
  status: 'pending',
  page: 1,
  limit: 10
});

// Get single order
const { order, items } = await orderService.getOrder('ORD-123');

// Create order
const newOrder = await orderService.createOrder({
  orderId: 'ORD-123',
  zone: 'Zone A',
  itemCount: 10,
  targetTime: 300
});

// Update order status
await orderService.updateOrderStatus('ORD-123', {
  status: 'completed',
  pickTime: 250
});
```

### Available Services

1. **authService**: Authentication (sendOTP, verifyOTP, getMe, logout)
2. **orderService**: Order management (getOrders, getOrder, createOrder, updateOrderStatus)
3. **bagService**: Bag operations (scanBag, getBag, updateBag)
4. **itemService**: Item operations (getItemsByOrder, scanItem, markItemNotFound, updateItem)
5. **rackService**: Rack operations (scanRack, getRack)
6. **taskService**: Task management (getTasks, getTask, updateTask)
7. **photoService**: Photo uploads (uploadPhoto, getPhoto, verifyPhoto)

## Integration Status

### ✅ Completed

- [x] API service layer with authentication
- [x] Auth context with token management
- [x] Backend CORS configuration for React Native
- [x] LoginScreen integration (send OTP)
- [x] OTPScreen integration (verify OTP)
- [x] Token persistence with AsyncStorage
- [x] Error handling and loading states

### 🔄 Pending

- [ ] HomeScreen integration (fetch orders/tasks)
- [ ] OrderReceivedScreen integration
- [ ] BagScanScreen integration
- [ ] ActivePickSessionScreen integration
- [ ] Photo upload integration
- [ ] Real-time updates with Socket.IO
- [ ] Offline support

## Testing

### Development Testing

1. **Start Backend**:
   ```bash
   cd HHD-APP-Backend
   npm run dev
   ```

2. **Start Frontend**:
   ```bash
   npm start
   ```

3. **Test Authentication**:
   - Enter mobile number in LoginScreen
   - Check console for OTP (development mode)
   - Enter OTP to verify

### Physical Device Testing

1. Find your computer's IP address:
   ```bash
   # Windows
   ipconfig
   
   # Mac/Linux
   ifconfig
   ```

2. Update `src/config/api.ts`:
   ```typescript
   return 'http://YOUR_IP_ADDRESS:5000/api';
   ```

3. Ensure both devices are on the same network

## Error Handling

All API calls throw errors that can be caught:

```typescript
try {
  await orderService.getOrders();
} catch (error: any) {
  console.error('Error:', error.message);
  Alert.alert('Error', error.message);
}
```

## Token Management

- Tokens are automatically stored in AsyncStorage
- Tokens are included in all authenticated requests
- On 401 errors, tokens are automatically removed
- Auth context checks token validity on app start

## Next Steps

1. Integrate API calls in remaining screens
2. Add Socket.IO for real-time order updates
3. Implement offline support with caching
4. Add retry logic for failed requests
5. Add request/response interceptors for logging

## Troubleshooting

### CORS Errors

- Ensure backend CORS allows all origins in development
- Check that backend is running on correct port
- Verify API base URL in `src/config/api.ts`

### Network Errors

- Check backend is running: `http://localhost:5000/health`
- Verify MongoDB connection
- Check firewall settings for physical device testing

### Authentication Errors

- Verify JWT_SECRET in backend `.env`
- Check token storage in AsyncStorage
- Ensure mobile number format is correct (10 digits)

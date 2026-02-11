# Seed Scripts

This directory contains database seed scripts for populating test data.

## Seed Assigned Orders

There are two scripts available for inserting assigned orders data:

### Option 1: Using Order Model (Standard)

The `seed-assigned-orders.ts` script uses the `Order` model to insert 5 assigned orders into the `orders` collection:
- 3 orders with status 'pending'
- 2 orders with other statuses (picking, rack_assigned)
- All orders have `riderName` and `riderId` set (making them "assigned")

**Usage:**
```bash
npm run seed:assigned-orders
```

### Option 2: Direct Collection Insert

The `seed-assignorders-collection.ts` script inserts directly into the `assignorders` collection (if it exists as a separate collection):
- 3 orders with status 'pending'
- 2 orders with other statuses (picking, rack_assigned)
- All orders have `riderName` and `riderId` set

**Usage:**
```bash
npm run seed:assignorders-collection
```

### Requirements

- MongoDB must be running
- Database connection configured in `.env` file
- The script will create a test user if one doesn't exist (mobile: 9876543210)

### What the scripts do

1. Connect to the database
2. Create or find a test user
3. Delete any existing orders with the same orderIds (ORDER-ASSIGN-001 to ORDER-ASSIGN-005)
4. Insert 5 new assigned orders with the following details:
   - ORDER-ASSIGN-001: Status 'pending', Rider 'John Doe', Zone A
   - ORDER-ASSIGN-002: Status 'pending', Rider 'Jane Smith', Zone B
   - ORDER-ASSIGN-003: Status 'pending', Rider 'Mike Johnson', Zone C
   - ORDER-ASSIGN-004: Status 'picking', Rider 'Sarah Williams', Zone D
   - ORDER-ASSIGN-005: Status 'rack_assigned', Rider 'David Brown', Zone A

### Which script to use?

- Use `seed-assigned-orders.ts` if you want to use the standard Order model (data goes to `orders` collection)
- Use `seed-assignorders-collection.ts` if you have a separate `assignorders` collection in your database

## Seed Orders for All Users

The `seed-orders-for-all-users.ts` script assigns 10 orders to **all users** present in the database users table:
- Fetches all users from the `users` collection
- Creates 10 unique orders for each user
- Each user gets orders with different statuses (3 pending, 1 received, 1 bag_scanned, 2 picking, 2 rack_assigned, 1 completed)
- Orders are distributed across different zones (A, B, C, D, repeating)
- Each order includes associated items in the `items` collection

**Usage:**
```bash
npm run seed:orders-for-all-users
```

### Requirements

- MongoDB must be running
- Database connection configured in `.env` file
- At least one user must exist in the database (the script will notify if no users are found)

### What the script does

1. Connects to the database
2. Fetches all users from the `users` collection
3. For each user:
   - Generates 10 unique order IDs (format: `ORDER-{userId}-{001-010}`)
   - Deletes any existing orders with the same orderIds (if they exist)
   - Creates 10 new orders with varying:
     - Zones (A, B, C, D, repeating)
     - Statuses (pending, pending, pending, received, bag_scanned, picking, picking, rack_assigned, rack_assigned, completed)
     - Item counts (5, 7, 9, 11, 13, 15, 17, 19, 21, 23)
     - Target times (20, 25, 30, 35, 40, 45, 50, 55, 60, 65 minutes)
   - Creates associated items for each order
4. Displays a summary of all created orders and items

### Order Details per User

Each user receives 10 orders:
- **Order 1**: Zone A, Status 'pending', 5 items, 20 min target
- **Order 2**: Zone B, Status 'pending', 7 items, 25 min target
- **Order 3**: Zone C, Status 'pending', 9 items, 30 min target
- **Order 4**: Zone D, Status 'received', 11 items, 35 min target
- **Order 5**: Zone A, Status 'bag_scanned', 13 items, 40 min target
- **Order 6**: Zone B, Status 'picking', 15 items, 45 min target
- **Order 7**: Zone C, Status 'picking', 17 items, 50 min target
- **Order 8**: Zone D, Status 'rack_assigned', 19 items, 55 min target
- **Order 9**: Zone A, Status 'rack_assigned', 21 items, 60 min target
- **Order 10**: Zone B, Status 'completed', 23 items, 65 min target
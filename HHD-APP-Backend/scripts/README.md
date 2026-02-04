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

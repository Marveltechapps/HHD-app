import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { connectDB } from '../src/config/database';
import Order from '../src/models/Order.model';
import User from '../src/models/User.model';
import Item from '../src/models/Item.model';
import { ORDER_STATUS, ZONE } from '../src/utils/constants';

// Load environment variables
dotenv.config();

type SeedItem = {
  itemCode: string;
  name: string;
  quantity: number;
  category: 'Fresh' | 'Snacks' | 'Grocery' | 'Care';
  location?: string;
  notes?: string;
};

const SEED_CATALOG: Omit<SeedItem, 'quantity'>[] = [
  { itemCode: 'ITM-ONION', name: 'Onion', category: 'Fresh', location: 'NGE-I-3-A-1' },
  { itemCode: 'ITM-TOMATO', name: 'Tomato', category: 'Fresh', location: 'NGE-I-3-A-2' },
  { itemCode: 'ITM-POTATO', name: 'Potato', category: 'Fresh', location: 'NGE-I-3-A-3' },
  { itemCode: 'ITM-CARROT', name: 'Carrot', category: 'Fresh', location: 'NGE-I-3-A-4' },
  { itemCode: 'ITM-CAPSICUM', name: 'Capsicum', category: 'Fresh', location: 'NGE-I-3-A-5' },
  { itemCode: 'ITM-CHIPS', name: 'Potato Chips', category: 'Snacks', location: 'SNK-2-B-3' },
  { itemCode: 'ITM-BISCUITS', name: 'Biscuits', category: 'Snacks', location: 'SNK-2-B-5' },
  { itemCode: 'ITM-RICE', name: 'Rice', category: 'Grocery', location: 'GRC-1-C-2' },
  { itemCode: 'ITM-ATTA', name: 'Wheat Flour (Atta)', category: 'Grocery', location: 'GRC-1-C-6' },
  { itemCode: 'ITM-SOAP', name: 'Bath Soap', category: 'Care', location: 'CAR-4-D-1' },
  { itemCode: 'ITM-SHAMP', name: 'Shampoo', category: 'Care', location: 'CAR-4-D-4' },
];

const buildSeedItems = (orderId: string, itemCount: number): SeedItem[] => {
  const uniqueSkus = Math.min(Math.max(3, Math.ceil(itemCount / 3)), 6);
  const picks = SEED_CATALOG.slice(0, uniqueSkus);

  const items: SeedItem[] = picks.map((p) => ({ ...p, quantity: 1 }));
  let remaining = itemCount - items.reduce((sum, it) => sum + it.quantity, 0);

  if (remaining > 0) {
    items[items.length - 1] = {
      ...items[items.length - 1],
      quantity: items[items.length - 1].quantity + remaining,
    };
  }

  return items.map((it) => ({ ...it, notes: `Seeded for ${orderId}` }));
};

/**
 * Seed script to insert 5 assigned orders
 * 3 orders will have status 'pending'
 * 2 orders will have other statuses
 */
const seedAssignedOrders = async (): Promise<void> => {
  try {
    console.log('🔄 Connecting to database...');
    await connectDB();

    // Get or create a user for the orders
    let user = await User.findOne({ mobile: '9876543210' });
    
    if (!user) {
      console.log('👤 Creating test user...');
      user = await User.create({
        mobile: '9876543210',
        name: 'Test User',
        role: 'picker',
        isActive: true,
      });
      console.log('✅ Test user created');
    } else {
      console.log('✅ Using existing test user');
    }

    // Check if orders already exist
    const existingOrders = await Order.find({
      orderId: { $in: ['ORDER-ASSIGN-001', 'ORDER-ASSIGN-002', 'ORDER-ASSIGN-003', 'ORDER-ASSIGN-004', 'ORDER-ASSIGN-005'] }
    });

    if (existingOrders.length > 0) {
      console.log('⚠️  Some assigned orders already exist. Deleting them first...');
      await Order.deleteMany({
        orderId: { $in: ['ORDER-ASSIGN-001', 'ORDER-ASSIGN-002', 'ORDER-ASSIGN-003', 'ORDER-ASSIGN-004', 'ORDER-ASSIGN-005'] }
      });
      console.log('✅ Existing orders deleted');
    }

    // Create 5 assigned orders
    const assignedOrders = [
      {
        orderId: 'ORDER-ASSIGN-001',
        userId: user._id,
        zone: ZONE.A,
        status: ORDER_STATUS.PENDING, // Pending status
        itemCount: 5,
        items: buildSeedItems('ORDER-ASSIGN-001', 5),
        riderName: 'John Doe',
        riderId: 'RIDER-001',
        rackLocation: 'RACK-A1',
        bagId: 'BAG-001',
        targetTime: 30,
        startedAt: new Date(),
      },
      {
        orderId: 'ORDER-ASSIGN-002',
        userId: user._id,
        zone: ZONE.B,
        status: ORDER_STATUS.PENDING, // Pending status
        itemCount: 8,
        items: buildSeedItems('ORDER-ASSIGN-002', 8),
        riderName: 'Jane Smith',
        riderId: 'RIDER-002',
        rackLocation: 'RACK-B2',
        bagId: 'BAG-002',
        targetTime: 25,
        startedAt: new Date(),
      },
      {
        orderId: 'ORDER-ASSIGN-003',
        userId: user._id,
        zone: ZONE.C,
        status: ORDER_STATUS.PENDING, // Pending status
        itemCount: 12,
        items: buildSeedItems('ORDER-ASSIGN-003', 12),
        riderName: 'Mike Johnson',
        riderId: 'RIDER-003',
        rackLocation: 'RACK-C3',
        bagId: 'BAG-003',
        targetTime: 35,
        startedAt: new Date(),
      },
      {
        orderId: 'ORDER-ASSIGN-004',
        userId: user._id,
        zone: ZONE.D,
        status: ORDER_STATUS.PICKING, // Non-pending status
        itemCount: 6,
        items: buildSeedItems('ORDER-ASSIGN-004', 6),
        riderName: 'Sarah Williams',
        riderId: 'RIDER-004',
        rackLocation: 'RACK-D4',
        bagId: 'BAG-004',
        targetTime: 20,
        pickTime: 15,
        startedAt: new Date(),
      },
      {
        orderId: 'ORDER-ASSIGN-005',
        userId: user._id,
        zone: ZONE.A,
        status: ORDER_STATUS.RACK_ASSIGNED, // Non-pending status
        itemCount: 10,
        items: buildSeedItems('ORDER-ASSIGN-005', 10),
        riderName: 'David Brown',
        riderId: 'RIDER-005',
        rackLocation: 'RACK-A5',
        bagId: 'BAG-005',
        targetTime: 40,
        startedAt: new Date(),
      },
    ];

    console.log('📦 Inserting 5 assigned orders...');
    const createdOrders = await Order.insertMany(assignedOrders);

    // Also seed the Item collection so order details screens can fetch items by orderId
    const orderIds = assignedOrders.map((o) => o.orderId);
    console.log('🧹 Clearing existing items for these orders...');
    await Item.deleteMany({ orderId: { $in: orderIds } });

    const itemDocs = assignedOrders.flatMap((o: any) =>
      (o.items as SeedItem[]).map((it) => ({
        orderId: o.orderId,
        itemCode: it.itemCode,
        name: it.name,
        quantity: it.quantity,
        category: it.category,
        location: it.location,
        notes: it.notes,
      }))
    );

    console.log(`🧾 Inserting ${itemDocs.length} items into items collection...`);
    await Item.insertMany(itemDocs);

    console.log('✅ Successfully inserted assigned orders:');
    createdOrders.forEach((order) => {
      console.log(`   - ${order.orderId}: Status=${order.status}, Rider=${order.riderName}`);
    });

    console.log('\n📊 Summary:');
    console.log(`   Total assigned orders: ${createdOrders.length}`);
    console.log(`   Orders with 'pending' status: ${createdOrders.filter(o => o.status === ORDER_STATUS.PENDING).length}`);
    console.log(`   Orders with other statuses: ${createdOrders.filter(o => o.status !== ORDER_STATUS.PENDING).length}`);

    console.log('\n✅ Seed completed successfully!');
  } catch (error) {
    console.error('❌ Error seeding assigned orders:', error);
    throw error;
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Database connection closed');
    process.exit(0);
  }
};

// Run the seed script
seedAssignedOrders().catch((error) => {
  console.error('❌ Seed script failed:', error);
  process.exit(1);
});

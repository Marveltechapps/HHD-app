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
 * Seed script to assign 5 orders to all users in the database
 * Each user will get 5 orders with different statuses and zones
 */
const seedOrdersForAllUsers = async (): Promise<void> => {
  try {
    console.log('🔄 Connecting to database...');
    await connectDB();

    // Get all users from the database
    const users = await User.find({});
    
    if (users.length === 0) {
      console.log('⚠️  No users found in the database. Please create users first.');
      return;
    }

    console.log(`👥 Found ${users.length} user(s) in the database`);

    const zones = Object.values(ZONE);
    const statuses = [
      ORDER_STATUS.PENDING,
      ORDER_STATUS.PENDING,
      ORDER_STATUS.PENDING,
      ORDER_STATUS.PICKING,
      ORDER_STATUS.RACK_ASSIGNED,
    ];

    let totalOrdersCreated = 0;
    let totalItemsCreated = 0;

    // Process each user
    for (let userIndex = 0; userIndex < users.length; userIndex++) {
      const user = users[userIndex];
      console.log(`\n📦 Processing user ${userIndex + 1}/${users.length}: ${user.name || user.mobile} (${user._id})`);

      // Generate unique order IDs for this user
      const orderIds: string[] = [];
      for (let i = 1; i <= 5; i++) {
        const orderId = `ORDER-${String(user._id).slice(-6)}-${String(i).padStart(3, '0')}`;
        orderIds.push(orderId);
      }

      // Check if orders already exist for this user
      const existingOrders = await Order.find({
        orderId: { $in: orderIds }
      });

      if (existingOrders.length > 0) {
        console.log(`   ⚠️  ${existingOrders.length} order(s) already exist for this user. Deleting them first...`);
        await Order.deleteMany({
          orderId: { $in: orderIds }
        });
        await Item.deleteMany({
          orderId: { $in: orderIds }
        });
        console.log('   ✅ Existing orders deleted');
      }

      // Create 5 orders for this user
      const orders = orderIds.map((orderId, index) => {
        const zone = zones[index % zones.length];
        const status = statuses[index];
        const itemCount = 5 + (index * 2); // Varying item counts: 5, 7, 9, 11, 13

        return {
          orderId,
          userId: user._id,
          zone,
          status,
          itemCount,
          items: buildSeedItems(orderId, itemCount),
          riderName: `${user.name || 'Rider'} ${index + 1}`,
          riderId: `RIDER-${String(user._id).slice(-6)}-${index + 1}`,
          rackLocation: `RACK-${zone.replace('Zone ', '')}-${index + 1}`,
          bagId: `BAG-${String(user._id).slice(-6)}-${index + 1}`,
          targetTime: 20 + (index * 5), // Varying target times: 20, 25, 30, 35, 40
          ...(status !== ORDER_STATUS.PENDING && {
            startedAt: new Date(),
            ...(status === ORDER_STATUS.PICKING && { pickTime: 10 + index }),
          }),
        };
      });

      console.log(`   📦 Creating 5 orders for user...`);
      const createdOrders = await Order.insertMany(orders);
      totalOrdersCreated += createdOrders.length;

      // Also seed the Item collection
      const itemDocs = orders.flatMap((o: any) =>
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

      await Item.insertMany(itemDocs);
      totalItemsCreated += itemDocs.length;

      console.log(`   ✅ Created ${createdOrders.length} orders with ${itemDocs.length} items`);
      createdOrders.forEach((order) => {
        console.log(`      - ${order.orderId}: Zone=${order.zone}, Status=${order.status}`);
      });
    }

    console.log('\n📊 Summary:');
    console.log(`   Total users processed: ${users.length}`);
    console.log(`   Total orders created: ${totalOrdersCreated}`);
    console.log(`   Total items created: ${totalItemsCreated}`);
    console.log(`   Average orders per user: ${(totalOrdersCreated / users.length).toFixed(1)}`);

    console.log('\n✅ Seed completed successfully!');
  } catch (error) {
    console.error('❌ Error seeding orders for all users:', error);
    throw error;
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Database connection closed');
    process.exit(0);
  }
};

// Run the seed script
seedOrdersForAllUsers().catch((error) => {
  console.error('❌ Seed script failed:', error);
  process.exit(1);
});

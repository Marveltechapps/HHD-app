import mongoose, { Document, Schema } from 'mongoose';
import { INVENTORY_STATUS } from '../utils/constants';

export interface IInventory extends Document {
  sku: string; // itemCode
  binId: string; // location/bin
  quantity: number;
  status: string; // available, damaged, expired, blocked
  expiryDate?: Date;
  batchNumber?: string;
  createdAt: Date;
  updatedAt: Date;
}

const InventorySchema = new Schema<IInventory>(
  {
    sku: {
      type: String,
      required: [true, 'Please add a SKU'],
      index: true,
    },
    binId: {
      type: String,
      required: [true, 'Please add a bin ID'],
      index: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
    status: {
      type: String,
      enum: Object.values(INVENTORY_STATUS),
      default: INVENTORY_STATUS.AVAILABLE,
      index: true,
    },
    expiryDate: {
      type: Date,
    },
    batchNumber: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for efficient lookups
InventorySchema.index({ sku: 1, binId: 1 }, { unique: true });
InventorySchema.index({ sku: 1, status: 1 });
InventorySchema.index({ binId: 1, status: 1 });

const Inventory = mongoose.model<IInventory>('Inventory', InventorySchema);

export default Inventory;

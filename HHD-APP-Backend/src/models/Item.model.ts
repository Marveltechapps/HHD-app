import mongoose, { Document, Schema } from 'mongoose';
import { ITEM_STATUS } from '../utils/constants';

export interface IItem extends Document {
  orderId: string;
  itemCode: string;
  name: string;
  quantity: number;
  category?: string; // Fresh, Snacks, Grocery, Care
  status: string;
  scannedAt?: Date;
  location?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ItemSchema = new Schema<IItem>(
  {
    orderId: {
      type: String,
      required: true,
      index: true,
    },
    itemCode: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
      default: 1,
    },
    category: {
      type: String,
      enum: ['Fresh', 'Snacks', 'Grocery', 'Care'],
      index: true,
    },
    status: {
      type: String,
      enum: Object.values(ITEM_STATUS),
      default: ITEM_STATUS.PENDING,
      index: true,
    },
    scannedAt: {
      type: Date,
    },
    location: {
      type: String,
    },
    notes: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
ItemSchema.index({ orderId: 1, status: 1 });
ItemSchema.index({ itemCode: 1 });

const Item = mongoose.model<IItem>('Item', ItemSchema);

export default Item;

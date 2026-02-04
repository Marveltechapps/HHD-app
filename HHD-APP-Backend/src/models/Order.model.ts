import mongoose, { Document, Schema } from 'mongoose';
import { ORDER_STATUS, ZONE } from '../utils/constants';

export interface IOrder extends Document {
  orderId: string;
  userId: string;
  zone: string;
  status: string;
  itemCount: number;
  targetTime?: number; // in minutes
  pickTime?: number; // in minutes
  bagId?: string;
  rackLocation?: string;
  riderName?: string;
  riderId?: string;
  startedAt?: Date;
  completedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const OrderSchema = new Schema<IOrder>(
  {
    orderId: {
      type: String,
      required: [true, 'Please add an order ID'],
      unique: true,
      index: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    zone: {
      type: String,
      enum: Object.values(ZONE),
      required: true,
    },
    status: {
      type: String,
      enum: Object.values(ORDER_STATUS),
      default: ORDER_STATUS.PENDING,
      index: true,
    },
    itemCount: {
      type: Number,
      required: true,
      min: 1,
    },
    targetTime: {
      type: Number,
      min: 0,
    },
    pickTime: {
      type: Number,
      min: 0,
    },
    bagId: {
      type: String,
    },
    rackLocation: {
      type: String,
    },
    riderName: {
      type: String,
    },
    riderId: {
      type: String,
    },
    startedAt: {
      type: Date,
    },
    completedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for performance
OrderSchema.index({ userId: 1, status: 1 });
OrderSchema.index({ status: 1, createdAt: -1 });

const Order = mongoose.model<IOrder>('Order', OrderSchema);

export default Order;

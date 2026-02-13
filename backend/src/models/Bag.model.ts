import mongoose, { Document, Schema } from 'mongoose';
import { BAG_STATUS } from '../utils/constants';

export interface IBag extends Document {
  bagId: string;
  orderId: string;
  userId: string;
  status: string;
  size?: string; // Bag size extracted from QR code (e.g., "15L", "25L", "35L", "50L")
  scannedAt?: Date;
  photoUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

const BagSchema = new Schema<IBag>(
  {
    bagId: {
      type: String,
      required: true,
      unique: true, // Bag ID must be globally unique
      index: true,
    },
    orderId: {
      type: String,
      required: true,
      index: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    status: {
      type: String,
      enum: Object.values(BAG_STATUS),
      default: BAG_STATUS.SCANNED,
      index: true,
    },
    size: {
      type: String,
      index: true,
    },
    scannedAt: {
      type: Date,
      default: Date.now,
    },
    photoUrl: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
BagSchema.index({ orderId: 1, status: 1 });

const Bag = mongoose.model<IBag>('Bag', BagSchema);

export default Bag;

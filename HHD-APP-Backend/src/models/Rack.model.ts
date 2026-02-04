import mongoose, { Document, Schema } from 'mongoose';

export interface IRack extends Document {
  rackCode: string;
  rackIdentifier: string; // e.g., "D1", "A1", "B2"
  slotNumber: number; // e.g., 3, 5, 10
  location: string;
  zone: string;
  isAvailable: boolean;
  currentOrderId?: string;
  riderName?: string;
  riderId?: string;
  assignedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const RackSchema = new Schema<IRack>(
  {
    rackCode: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    rackIdentifier: {
      type: String,
      required: true,
      index: true,
    },
    slotNumber: {
      type: Number,
      required: true,
    },
    location: {
      type: String,
      required: true,
    },
    zone: {
      type: String,
      required: true,
      index: true,
    },
    isAvailable: {
      type: Boolean,
      default: true,
      index: true,
    },
    currentOrderId: {
      type: String,
    },
    riderName: {
      type: String,
    },
    riderId: {
      type: String,
    },
    assignedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
RackSchema.index({ zone: 1, isAvailable: 1 });
RackSchema.index({ rackIdentifier: 1, slotNumber: 1 }, { unique: true });

const Rack = mongoose.model<IRack>('Rack', RackSchema);

export default Rack;

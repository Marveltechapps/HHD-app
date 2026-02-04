import mongoose, { Document, Schema } from 'mongoose';

export interface IScannedItem extends Document {
  barcodeData: string;
  barcodeType: string; // 'qr', 'ean13', 'ean8', 'code128', etc.
  orderId?: string;
  userId?: string;
  deviceId?: string;
  metadata?: {
    itemName?: string;
    quantity?: number;
    location?: string;
    [key: string]: any;
  };
  scannedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const ScannedItemSchema = new Schema<IScannedItem>(
  {
    barcodeData: {
      type: String,
      required: true,
      index: true,
    },
    barcodeType: {
      type: String,
      required: true,
      enum: ['qr', 'ean13', 'ean8', 'code128', 'code39', 'upc', 'other'],
      default: 'other',
    },
    orderId: {
      type: String,
      index: true,
    },
    userId: {
      type: String,
      index: true,
    },
    deviceId: {
      type: String,
      index: true,
    },
    metadata: {
      type: Schema.Types.Mixed,
      default: {},
    },
    scannedAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  {
    timestamps: true,
    collection: 'scanned_items',
  }
);

// Indexes for efficient queries
ScannedItemSchema.index({ barcodeData: 1, scannedAt: -1 });
ScannedItemSchema.index({ orderId: 1, scannedAt: -1 });
ScannedItemSchema.index({ userId: 1, scannedAt: -1 });
ScannedItemSchema.index({ deviceId: 1, scannedAt: -1 });

const ScannedItem = mongoose.model<IScannedItem>('ScannedItem', ScannedItemSchema);

export default ScannedItem;

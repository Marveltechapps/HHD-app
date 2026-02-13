import mongoose, { Document, Schema } from 'mongoose';

export interface IPhoto extends Document {
  orderId: string;
  bagId: string;
  userId: string;
  photoUrl: string;
  photoKey?: string; // S3 key if using AWS
  verified: boolean;
  verifiedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const PhotoSchema = new Schema<IPhoto>(
  {
    orderId: {
      type: String,
      required: true,
      index: true,
    },
    bagId: {
      type: String,
      required: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    photoUrl: {
      type: String,
      required: true,
    },
    photoKey: {
      type: String,
    },
    verified: {
      type: Boolean,
      default: false,
    },
    verifiedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
PhotoSchema.index({ orderId: 1, bagId: 1 });

const Photo = mongoose.model<IPhoto>('Photo', PhotoSchema);

export default Photo;

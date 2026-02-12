import mongoose, { Document, Schema } from 'mongoose';
import { PICK_ISSUE_TYPE } from '../utils/constants';

export interface IPickIssue extends Document {
  orderId: string;
  sku: string; // itemCode
  binId: string; // location/bin
  issueType: string;
  reportedBy: string; // userId
  deviceId?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const PickIssueSchema = new Schema<IPickIssue>(
  {
    orderId: {
      type: String,
      required: [true, 'Please add an order ID'],
      index: true,
    },
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
    issueType: {
      type: String,
      enum: Object.values(PICK_ISSUE_TYPE),
      required: [true, 'Please add an issue type'],
      index: true,
    },
    reportedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    deviceId: {
      type: String,
      index: true,
    },
    notes: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for efficient queries
PickIssueSchema.index({ orderId: 1, sku: 1 });
PickIssueSchema.index({ issueType: 1, createdAt: -1 });
PickIssueSchema.index({ binId: 1 });

const PickIssue = mongoose.model<IPickIssue>('PickIssue', PickIssueSchema);

export default PickIssue;

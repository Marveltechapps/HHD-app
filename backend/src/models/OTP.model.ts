import mongoose, { Document, Schema } from 'mongoose';

export interface IOTP extends Document {
  mobile: string;
  otp: string;
  expiresAt: Date;
  isUsed: boolean;
  createdAt: Date;
}

const OTPSchema = new Schema<IOTP>(
  {
    mobile: {
      type: String,
      required: true,
      index: true,
    },
    otp: {
      type: String,
      required: true,
    },
    expiresAt: {
      type: Date,
      required: true,
      index: { expireAfterSeconds: 0 },
    },
    isUsed: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Index for cleanup
OTPSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const OTP = mongoose.model<IOTP>('OTP', OTPSchema);

export default OTP;

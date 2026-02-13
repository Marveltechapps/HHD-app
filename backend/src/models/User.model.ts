import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { USER_ROLE } from '../utils/constants';

export interface IUser extends Document {
  mobile: string;
  name?: string;
  role: string;
  password?: string;
  isActive: boolean;
  deviceId?: string;
  lastLogin?: Date;
  createdAt: Date;
  updatedAt: Date;
  generateOTP(): string;
  matchPassword(enteredPassword: string): Promise<boolean>;
  getSignedJwtToken(): string;
}

const UserSchema = new Schema<IUser>(
  {
    mobile: {
      type: String,
      required: [true, 'Please add a mobile number'],
      unique: true,
      match: [/^[6-9]\d{9}$/, 'Please add a valid 10-digit mobile number'],
      index: true,
    },
    name: {
      type: String,
      trim: true,
    },
    role: {
      type: String,
      enum: Object.values(USER_ROLE),
      default: USER_ROLE.PICKER,
    },
    password: {
      type: String,
      select: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    deviceId: {
      type: String,
    },
    lastLogin: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Hash password before save
UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    next();
  }
  if (this.password) {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
  }
});

// Generate OTP (4-digit: 1000-9999)
// Note: This method is kept for backward compatibility
// The main OTP generation is handled by OTPService.generateOTP()
UserSchema.methods.generateOTP = function (): string {
  return Math.floor(1000 + Math.random() * 9000).toString();
};

// Match password
UserSchema.methods.matchPassword = async function (enteredPassword: string): Promise<boolean> {
  if (!this.password) return false;
  return await bcrypt.compare(enteredPassword, this.password);
};

// Generate JWT token
UserSchema.methods.getSignedJwtToken = function (): string {
  return jwt.sign({ id: this._id }, process.env.JWT_SECRET || '', {
    expiresIn: process.env.JWT_EXPIRE || '7d',
  });
};

const User = mongoose.model<IUser>('User', UserSchema);

export default User;

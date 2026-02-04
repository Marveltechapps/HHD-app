import mongoose, { Document, Schema } from 'mongoose';
import { TASK_STATUS, TASK_PRIORITY } from '../utils/constants';

export interface ITask extends Document {
  title: string;
  description?: string;
  userId: string;
  orderId?: string;
  status: string;
  priority: string;
  dueDate?: Date;
  completedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const TaskSchema = new Schema<ITask>(
  {
    title: {
      type: String,
      required: [true, 'Please add a task title'],
    },
    description: {
      type: String,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    orderId: {
      type: String,
    },
    status: {
      type: String,
      enum: Object.values(TASK_STATUS),
      default: TASK_STATUS.PENDING,
      index: true,
    },
    priority: {
      type: String,
      enum: Object.values(TASK_PRIORITY),
      default: TASK_PRIORITY.MEDIUM,
    },
    dueDate: {
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

// Indexes
TaskSchema.index({ userId: 1, status: 1 });
TaskSchema.index({ status: 1, priority: 1 });

const Task = mongoose.model<ITask>('Task', TaskSchema);

export default Task;

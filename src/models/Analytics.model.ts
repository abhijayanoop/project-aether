import mongoose, { Schema } from 'mongoose';

export interface IAnalytics extends Document {
  userId?: mongoose.Types.ObjectId;
  userEmail?: string;
  eventType: string;
  eventCategory: 'auth' | 'content' | 'study-materials' | 'ai' | 'system';
  timestamp: Date;
  endpoint?: string;
  method?: string;
  statusCode?: number;
  responseTime?: number;
  metadata?: any;
  error?: {
    message: string;
    stack?: string;
    code?: string;
  };
}

const analyticsSchema = new Schema<IAnalytics>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      index: true,
    },
    userEmail: String,
    eventType: {
      type: String,
      required: true,
      index: true,
    },
    eventCategory: {
      type: String,
      enum: ['auth', 'content', 'study-materials', 'ai', 'system'],
      required: true,
      index: true,
    },
    timestamp: {
      type: Date,
      default: Date.now,
      index: true,
    },
    endpoint: String,
    method: String,
    statusCode: Number,
    responseTime: Number,
    metadata: Schema.Types.Mixed,
    error: {
      message: String,
      stack: String,
      code: String,
    },
  },
  { timestamps: true }
);

// compound indexing
analyticsSchema.index({ userId: 1, timestamp: -1 });
analyticsSchema.index({ eventType: 1, timestamp: -1 });
analyticsSchema.index({ timestamp: -1, statusCode: 1 });

// auto delete after 90 days
analyticsSchema.index({ timeStamp: -1 }, { expireAfterSeconds: 7776000 });

export const Analytics = mongoose.model<IAnalytics>(
  'Analytics',
  analyticsSchema
);

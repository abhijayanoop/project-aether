import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IContent extends Document {
  userId: Types.ObjectId;
  type: 'url' | 'pdf' | 'document' | 'youtube';
  sourceUrl: string;
  title: string;
  content: string;
  metadata: Record<string, any>;
  processingStatus: 'pending' | 'processing' | 'completed' | 'failed';
  errorMessage?: string;
  createdAt: Date;
}

const ContentSchema = new Schema<IContent>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    type: {
      type: String,
      enum: ['url', 'pdf', 'document', 'youtube'],
      required: true,
    },
    sourceUrl: {
      type: String,
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    content: {
      type: String,
      default: '',
    },
    metadata: {
      type: Schema.Types.Mixed,
      default: {},
    },
    processingStatus: {
      type: String,
      enum: ['pending', 'processing', 'completed', 'failed'],
      default: 'pending',
    },
    errorMessage: String,
  },
  {
    timestamps: true,
  }
);

// Indexes
ContentSchema.index({ userId: 1, createdAt: -1 });
ContentSchema.index({ processingStatus: 1 });

export const Content = mongoose.model<IContent>('Content', ContentSchema);

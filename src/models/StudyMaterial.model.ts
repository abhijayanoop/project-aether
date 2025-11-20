import mongoose, { Schema } from 'mongoose';

export interface IStudyMaterial extends Document {
  userId: mongoose.Types.ObjectId;
  contentId: mongoose.Types.ObjectId;
  type: 'flashcard' | 'quiz' | 'summary' | 'concepts';
  title: string;
  data: any;
  tags: string[];
  folder?: string;
  isPublic: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const studyMaterialSchema = new Schema<IStudyMaterial>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    contentId: {
      type: Schema.Types.ObjectId,
      ref: 'Content',
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: ['flashcard', 'quiz', 'summary', 'concepts'],
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    data: {
      type: Schema.Types.Mixed,
      required: true,
    },
    tags: {
      type: [String],
      default: [],
      index: true,
    },
    folder: {
      type: String,
      trim: true,
      index: true,
    },
    isPublic: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

studyMaterialSchema.index({ userId: 1, type: 1, createdAt: -1 });
studyMaterialSchema.index({ userId: 1, folder: 1 });
studyMaterialSchema.index({ title: 'text' });

export const StudyMaterial = mongoose.model<IStudyMaterial>(
  'StudyMaterial',
  studyMaterialSchema
);

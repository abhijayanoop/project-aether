import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IStudyMaterial extends Document {
  userId: Types.ObjectId;
  title: string;
  sources: Types.ObjectId[];
  tableOfContents: Array<{
    title: string;
    level: number;
    page?: number;
  }>;
  content: {
    introduction: string;
    sections: Array<{
      title: string;
      content: string;
      sources: string[];
    }>;
    summary: string;
  };
  mindMap: Record<string, any>;
  quizzes: Types.ObjectId[];
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

const StudyMaterialSchema = new Schema<IStudyMaterial>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    sources: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Content',
      },
    ],
    tableOfContents: [
      {
        title: String,
        level: Number,
        page: Number,
      },
    ],
    content: {
      introduction: String,
      sections: [
        {
          title: String,
          content: String,
          sources: [String],
        },
      ],
      summary: String,
    },
    mindMap: Schema.Types.Mixed,
    quizzes: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Quiz',
      },
    ],
    tags: [String],
  },
  {
    timestamps: true,
  }
);

// Indexes
StudyMaterialSchema.index({ userId: 1, createdAt: -1 });
StudyMaterialSchema.index({ tags: 1 });
StudyMaterialSchema.index({ title: 'text', 'content.introduction': 'text' });

export const StudyMaterial = mongoose.model<IStudyMaterial>(
  'StudyMaterial',
  StudyMaterialSchema
);

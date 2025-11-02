import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IQuiz extends Document {
  studyMaterialId: Types.ObjectId;
  title: string;
  questions: Array<{
    question: string;
    options: string[];
    correctAnswer: number;
    explanation: string;
    difficulty: 'easy' | 'medium' | 'hard';
  }>;
  createdAt: Date;
}

const QuizSchema = new Schema<IQuiz>(
  {
    studyMaterialId: {
      type: Schema.Types.ObjectId,
      ref: 'StudyMaterial',
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    questions: [
      {
        question: {
          type: String,
          required: true,
        },
        options: {
          type: [String],
          required: true,
        },
        correctAnswer: {
          type: Number,
          required: true,
        },
        explanation: String,
        difficulty: {
          type: String,
          enum: ['easy', 'medium', 'hard'],
          default: 'medium',
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Indexes
QuizSchema.index({ studyMaterialId: 1 });

export const Quiz = mongoose.model<IQuiz>('Quiz', QuizSchema);

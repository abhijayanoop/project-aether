import mongoose, { Document, Schema } from 'mongoose';
import { hashPassword, verifyPassword } from '../utils/password.util';
import bcrypt from 'bcryptjs';

export interface IUser extends Document {
  email: string;
  password: string;
  name: string;
  settings: {
    aiModel: string;
    responseLength: 'short' | 'medium' | 'long';
    theme: 'light' | 'dark';
  };
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<Boolean>;
}

const UserSchema = new Schema<IUser>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      select: false, // Don't include in queries by default
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    settings: {
      aiModel: {
        type: String,
        default: 'gpt-4',
      },
      responseLength: {
        type: String,
        enum: ['short', 'medium', 'long'],
        default: 'medium',
      },
      theme: {
        type: String,
        enum: ['light', 'dark'],
        default: 'light',
      },
    },
  },
  {
    timestamps: true,
  }
);

UserSchema.index({ email: 1 });

UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();

  try {
    this.password = await hashPassword(this.password);
    next();
  } catch (error: any) {
    next();
  }
});

UserSchema.methods.comparePassword = async function (
  candidatePassword: string
): Promise<boolean> {
  if (!this.password) {
    console.error('Password field is undefined in comparePassword');
    throw new Error('Password field not selected');
  }

  return await verifyPassword(candidatePassword, this.password);
};

// delete password from json output
UserSchema.set('toJSON', {
  transform: function (doc, ret) {
    delete ret.password;
    return ret;
  },
});

export const User = mongoose.model<IUser>('User', UserSchema);

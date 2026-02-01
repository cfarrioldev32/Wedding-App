import { Schema, model } from 'mongoose';

export interface WishDocument {
  email: string;
  country: string;
  reason: string;
  createdAt: Date;
  ipHash?: string;
}

const wishSchema = new Schema<WishDocument>({
  email: { type: String, required: true, lowercase: true, trim: true },
  country: { type: String, required: true, minlength: 2, maxlength: 56 },
  reason: { type: String, required: true, minlength: 20, maxlength: 500 },
  createdAt: { type: Date, default: () => new Date() },
  ipHash: { type: String, required: false }
});

export const WishModel = model<WishDocument>('Wish', wishSchema, 'wishes');

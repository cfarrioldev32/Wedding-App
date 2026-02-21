import { Schema, model } from 'mongoose';

export interface RegistrationDocument {
  email: string;
  firstName: string;
  lastName: string;
  country: string;
  attendanceConfirmed: boolean;
  attendeesCount: number;
  createdAt: Date;
}

const registrationSchema = new Schema<RegistrationDocument>({
  email: { type: String, required: true, lowercase: true, trim: true },
  firstName: { type: String, required: true, trim: true },
  lastName: { type: String, required: true, trim: true },
  country: { type: String, required: true, trim: true },
  attendanceConfirmed: { type: Boolean, required: true },
  attendeesCount: { type: Number, required: true, min: 0 },
  createdAt: { type: Date, default: () => new Date() }
});

registrationSchema.index({ email: 1, createdAt: -1 });

export const RegistrationModel = model<RegistrationDocument>(
  'Registration',
  registrationSchema,
  'registrations'
);

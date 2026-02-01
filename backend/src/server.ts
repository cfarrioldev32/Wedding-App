import mongoose from 'mongoose';
import { createApp } from './app';
import { env } from './config/env';

const start = async (): Promise<void> => {
  if (!env.MONGODB_URI) {
    throw new Error('MONGODB_URI is required');
  }

  mongoose.connection.on('connected', () => {
    console.log('MongoDB connected');
    console.log(`MongoDB database: ${mongoose.connection.name}`);
  });
  mongoose.connection.on('error', (error) => {
    console.error('MongoDB connection error', error);
  });

  await mongoose.connect(env.MONGODB_URI);
  const app = createApp();

  app.listen(env.PORT, () => {
    console.log(`API listening on port ${env.PORT}`);
  });
};

start().catch((error) => {
  console.error('Failed to start server', error);
  process.exit(1);
});

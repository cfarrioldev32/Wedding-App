import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { env } from './config/env';
import { errorHandler } from './middleware/error';
import { healthRouter } from './routes/health.routes';
import { wishRouter } from './routes/wish.routes';
import { quizRouter } from './routes/quiz.routes';
import { registrationRouter } from './routes/registration.routes';

export const createApp = (): express.Express => {
  const app = express();

  app.use(helmet());
  app.use(express.json({ limit: '1mb' }));
  app.use(morgan('tiny'));

  const allowedOrigins = env.ALLOWED_ORIGINS;
  const allowAllOrigins = allowedOrigins.includes('*');
  app.use(
    cors({
      origin: (origin, callback) => {
        if (!origin) {
          return callback(null, true);
        }
        if (allowAllOrigins || allowedOrigins.length === 0) {
          return callback(null, true);
        }
        if (allowedOrigins.includes(origin)) {
          return callback(null, true);
        }
        return callback(new Error('Origin not allowed by CORS'));
      }
    })
  );

  app.use('/health', healthRouter);
  app.use('/api/registrations', registrationRouter);
  app.use('/api/wishes', wishRouter);
  app.use('/api/quiz-results', quizRouter);

  app.use(errorHandler);

  return app;
};

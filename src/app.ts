import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import router from './routes';
import { env } from './config/env.config';
import { errorMiddleware } from './middlewares/error.middleware';
import { notFoundMiddleware } from './middlewares/not-found.middleware';

export const app = express();

const allowedOrigins = env.ALLOWED_ORIGINS.split(',').map((o) => o.trim());

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error(`CORS: origin ${origin} not allowed`));
      }
    },
    credentials: true,
  })
);
app.use(helmet());
app.use(express.json());

app.use('/api', router);

app.use(notFoundMiddleware);
app.use(errorMiddleware);

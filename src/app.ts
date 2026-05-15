import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import router from './routes';
import { env } from './config/env.config';
import { errorMiddleware } from './middlewares/error.middleware';
import { notFoundMiddleware } from './middlewares/not-found.middleware';

export const app = express();

app.use(
  cors({
    origin: env.ALLOWED_ORIGINS.split(',').map((o) => o.trim()),
    credentials: true,
  }),
);
app.use(helmet());
app.use(express.json());

app.use('/api', router);

app.use(notFoundMiddleware);
app.use(errorMiddleware);

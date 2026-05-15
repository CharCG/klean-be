import dotenv from 'dotenv';

dotenv.config();

const requireEnv = (key: string): string => {
  const value = process.env[key];
  if (!value) throw new Error(`Missing required environment variable: ${key}`);
  return value;
};

export const env = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: process.env.PORT || 3000,
  DATABASE_URL: requireEnv('DATABASE_URL'),
  JWT_SECRET: requireEnv('JWT_SECRET'),
  ALLOWED_ORIGINS: process.env.ALLOWED_ORIGINS || 'http://localhost:5173',
  MIDTRANS_SERVER_KEY: requireEnv('MIDTRANS_SERVER_KEY'),
  MIDTRANS_CLIENT_KEY: requireEnv('MIDTRANS_CLIENT_KEY'),
  MIDTRANS_IS_PRODUCTION: requireEnv('MIDTRANS_IS_PRODUCTION') === 'true',
  SUPABASE_URL: requireEnv('SUPABASE_URL'),
  SUPABASE_KEY: requireEnv('SUPABASE_KEY'),
} as const;

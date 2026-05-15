import midtransClient from 'midtrans-client';
import { env } from './env.config';

export const snap = new midtransClient.Snap({
  isProduction: env.MIDTRANS_IS_PRODUCTION,
  serverKey: env.MIDTRANS_SERVER_KEY,
  clientKey: env.MIDTRANS_CLIENT_KEY,
});

export const createSnapTransaction = async (parameter: any) => {
  return snap.createTransaction(parameter);
};

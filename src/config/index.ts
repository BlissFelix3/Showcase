import * as path from 'node:path';
import * as dotenv from 'dotenv';

dotenv.config({
  path: path.resolve(process.cwd(), './.env'),
});

export default {
  port: Number.parseInt(process.env.PORT ?? '3000', 10),
  env: process.env.ENV,
  baseUrl: process.env.BASE_URL || `http://localhost:${process.env.PORT}`,
  jwt: {
    privateKey: process.env.PRIVATE_KEY ?? '',
    publicKey: process.env.PUBLIC_KEY ?? '',
    expiresIn: Number.isNaN(Number.parseInt(process.env.JWT_EXPIRES_IN ?? ''))
      ? '6h'
      : Number.parseInt(process.env.JWT_EXPIRES_IN ?? '21600', 10),
    issuer: process.env.ISSUER || 'sulhu',
  },
  redis: {
    host: process.env.REDIS_HOST,
    username: process.env.REDIS_USER,
    password: process.env.REDIS_PASS,
    port: Number(process.env.REDIS_PORT),
  },
  db: { url: process.env.DATABASE_URL },
  mailgun: {
    apiKey: process.env.MAILGUN_KEY,
    domain: process.env.MAILGUN_DOMAIN,
    from: process.env.MAILGUN_FROM,
  },
  paystack: {
    key: process.env.PAYSTACK_KEY,
    url: process.env.PAYSTACK_BASEURL,
    bank: process.env.PAYSTACK_PREFFERED_BANK,
  },
  escrow: {
    provider: process.env.ESCROW_PROVIDER || 'NONE',
    apiKey: process.env.ESCROW_API_KEY,
    baseUrl: process.env.ESCROW_BASEURL,
  },
  fcm: {
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    projectId: process.env.FCM_PROJECT_ID,
  },
  fireBaseLinkService: {
    baseUrl: process.env.FIREBASE_BASE_URL,
    key: process.env.FIREBASE_API_KEY,
  },
};

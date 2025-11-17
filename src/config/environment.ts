import { z } from 'zod';
import dotenv from 'dotenv';

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z
    .enum(['development', 'production', 'test'])
    .default('development'),
  PORT: z.string().default('5000'),
  ALLOWED_ORIGINS: z.string(),
  MONGODB_URI: z.string(),
  JWT_SECRET: z.string(),
  JWT_EXPIRES_IN: z.string().default('24h'),
  JWT_REFRESH_SECRET: z.string(),
  JWT_REFRESH_EXPIRES_IN: z.string().default('7d'),
  REDIS_HOST: z.string().default('localhost'),
  REDIS_PORT: z.string().default('6379'),
  REDIS_PASSWORD: z.string().optional(),
  GEMINI_API_KEY: z.string().min(1, 'Gemini API key is required'),
  GEMINI_MODEL: z.string().default('gemini-2.5-flash-lite'),
});

type Env = z.infer<typeof envSchema>;

const parseEnv = (): Env => {
  try {
    return envSchema.parse(process.env);
  } catch (error) {
    console.error('Invalid environment variables', error);
    process.exit(1);
  }
};

export const env = parseEnv();

import dotenv from 'dotenv';

dotenv.config();

const stripQuotes = (value: string): string => {
  if (
    (value.startsWith('"') && value.endsWith('"')) ||
    (value.startsWith("'") && value.endsWith("'"))
  ) {
    return value.slice(1, -1);
  }
  return value;
};

const getEnv = (key: string, fallback?: string): string => {
  const value = process.env[key];
  if (value && value.trim().length > 0) {
    return stripQuotes(value.trim());
  }
  if (fallback !== undefined) {
    return fallback;
  }
  return '';
};

export const env = {
  PORT: Number(getEnv('PORT', '3000')),
  MONGODB_URI: getEnv('MONGODB_URI'),
  ADMIN_TOKEN: getEnv('ADMIN_TOKEN'),
  ALLOWED_ORIGINS: getEnv('ALLOWED_ORIGINS', '')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean)
};

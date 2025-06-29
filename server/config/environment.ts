// Environment configuration for TikTok affiliate marketing platform
export interface EnvironmentConfig {
  // Server configuration
  PORT: number;
  NODE_ENV: 'development' | 'production' | 'test';
  
  // JWT configuration
  JWT_SECRET: string;
  JWT_EXPIRES_IN: string;
  
  // TikTok Business API
  TIKTOK_CLIENT_KEY: string;
  TIKTOK_CLIENT_SECRET: string;
  TIKTOK_ADVERTISER_ID: string;
  TIKTOK_REDIRECT_URI: string;
  TIKTOK_ACCESS_TOKEN?: string;
  
  // Google Gemini AI
  GEMINI_API_KEY: string;
  
  // Database
  DATABASE_URL?: string;
  
  // Optional external services
  STRIPE_SECRET_KEY?: string;
  SENDGRID_API_KEY?: string;
  TWILIO_ACCOUNT_SID?: string;
  TWILIO_AUTH_TOKEN?: string;
  TWILIO_PHONE_NUMBER?: string;
  
  // Security
  WEBHOOK_SECRET?: string;
}

export const getEnvironmentConfig = (): EnvironmentConfig => {
  const config: EnvironmentConfig = {
    PORT: parseInt(process.env.PORT || '5000', 10),
    NODE_ENV: (process.env.NODE_ENV as any) || 'development',
    
    JWT_SECRET: process.env.JWT_SECRET || 'dev-secret-key-change-in-production',
    JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
    
    TIKTOK_CLIENT_KEY: process.env.TIKTOK_CLIENT_KEY || '7519035078651936769',
    TIKTOK_CLIENT_SECRET: process.env.TIKTOK_CLIENT_SECRET || '',
    TIKTOK_ADVERTISER_ID: process.env.TIKTOK_ADVERTISER_ID || '7519829315018588178',
    TIKTOK_REDIRECT_URI: process.env.TIKTOK_REDIRECT_URI || '',
    TIKTOK_ACCESS_TOKEN: process.env.TIKTOK_ACCESS_TOKEN,
    
    GEMINI_API_KEY: process.env.GEMINI_API_KEY || '',
    
    DATABASE_URL: process.env.DATABASE_URL,
    
    STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,
    SENDGRID_API_KEY: process.env.SENDGRID_API_KEY,
    TWILIO_ACCOUNT_SID: process.env.TWILIO_ACCOUNT_SID,
    TWILIO_AUTH_TOKEN: process.env.TWILIO_AUTH_TOKEN,
    TWILIO_PHONE_NUMBER: process.env.TWILIO_PHONE_NUMBER,
    
    WEBHOOK_SECRET: process.env.WEBHOOK_SECRET,
  };

  // Validate required environment variables
  const requiredVars = [
    'TIKTOK_CLIENT_SECRET',
    'GEMINI_API_KEY'
  ];

  const missingVars = requiredVars.filter(varName => !config[varName as keyof EnvironmentConfig]);
  
  if (missingVars.length > 0) {
    throw new Error(`Missing required environment variables: ${missingVars.join(', ')}`);
  }

  return config;
};

export const env = getEnvironmentConfig();
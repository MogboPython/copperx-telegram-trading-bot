import dotenv from 'dotenv';
dotenv.config();


export const config = {
  // Bot configuration
  TELEGRAM_BOT_TOKEN: process.env.TELEGRAM_BOT_TOKEN || '',
  
  // API configuration
  COPPERX_API_BASE_URL: process.env.COPPERX_API_BASE_URL || '',

  // CopperX API key
  COPPERX_API_KEY: process.env.COPPERX_API_KEY || '',

  // PUSHER API SECRET KEYS
  VITE_PUSHER_CLUSTER: process.env.VITE_PUSHER_CLUSTER || '',
  PUSHER_CLUSTER: process.env.PUSHER_CLUSTER || '',
  
  // Session configuration
  SESSION_KEY: process.env.SESSION_KEY || 'copperx:session',

  // MongoDB configuration
  MONGODB_URI: process.env.MONGODB_URI || 'mongodb://localhost:27017',
  MONGODB_DB_NAME: process.env.MONGODB_DB_NAME || 'copperx_bot_test',
  MONGODB_COLLECTION: process.env.MONGODB_COLLECTION || 'sessions',
};

// Validate required configuration
if (!config.TELEGRAM_BOT_TOKEN) {
  throw new Error('BOT_TOKEN is required in environment variables');
}
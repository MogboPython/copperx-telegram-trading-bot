import dotenv from 'dotenv';
dotenv.config();

export const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || '';
export const COPPERX_API_KEY = process.env.COPPERX_API_KEY || '';
export const COPPERX_API_BASE_URL = process.env.COPPERX_API_BASE_URL || '';
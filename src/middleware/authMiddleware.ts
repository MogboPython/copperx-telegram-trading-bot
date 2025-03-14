import { Context, Middleware } from 'telegraf';
import { authService } from '../services/authService';

export const authMiddleware: Middleware<Context> = async (ctx, next) => {
  // Skip auth check for the start command
  if (ctx.message && 'text' in ctx.message && ctx.message.text === '/start') {
    return next();
  }

  // Skip auth check for connect_account action
  if (ctx.callbackQuery && 'data' in ctx.callbackQuery && ctx.callbackQuery.data === 'connect_account') {
    return next();
  }

  const telegramId = ctx.from?.id;
  
  if (!telegramId) {
    await ctx.reply('Error: Could not identify user.');
    return;
  }
  
  // Check if user is authenticated
  if (!authService.isAuthenticated(telegramId)) {
    await ctx.reply(
      'Please connect your Copperx account first. Use /start to begin.',
    );
    return;
  }
  
  return next();
};
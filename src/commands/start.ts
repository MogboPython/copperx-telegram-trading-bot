import { Context, Markup } from 'telegraf';
import { authService } from '../services/authService';
import { getMainMenuKeyboard } from '../keyboards/mainMenu';
import { getAuthKeyboard } from '../keyboards/authMenu';

export const startCommand = async (ctx: Context) => {
  const telegramId = ctx.from?.id;
  
  if (!telegramId) {
    await ctx.reply('Error: Could not identify user.');
    return;
  }
  
  const isAuthenticated = authService.isAuthenticated(telegramId);
  
  if (isAuthenticated) {
    const userData = authService.getUserData(telegramId);
    await ctx.reply(
      `Welcome back to Copperx Payout, ${userData?.name || 'User'}! \n\nWhat would you like to do today?`,
      getMainMenuKeyboard()
    );
  } else {
    await ctx.reply(
      'Welcome to Copperx Payout! To get started, please connect your account:',
      getAuthKeyboard()
    );
  }
};
import { Context } from 'telegraf';
import { authHandler } from './authHandler';
import { authService } from '../services/authService';

export const callbackHandler = async (ctx: Context) => {
    if (!ctx.callbackQuery || !('data' in ctx.callbackQuery)) {
      return;
    }
  
    const action = ctx.callbackQuery.data;
    const telegramId = ctx.from?.id;
  
    if (!telegramId) {
      await ctx.reply('Error: Could not identify user.');
      return;
    }
  
    // Handle actions that don't require authentication
    if (action === 'connect_account') {
      return authHandler.handleConnectAccount(ctx);
    }
  
    // For all other actions, check authentication
    if (!authService.isAuthenticated(telegramId)) {
      await ctx.answerCbQuery('Please connect your account first');
      await ctx.reply('Please connect your Copperx account first. Use /start to begin.');
      return;
    }
  
    // Handle authenticated actions
    switch (action) {
      case 'logout':
        return authHandler.handleLogout(ctx);
      case 'profile':
        await ctx.answerCbQuery();
        return ctx.reply('Profile feature coming soon!');
      case 'kyc_status':
        await ctx.answerCbQuery();
        return ctx.reply('KYC Status feature coming soon!');
      case 'wallets':
        await ctx.answerCbQuery();
        return ctx.reply('Wallets feature coming soon!');
      case 'balance':
        await ctx.answerCbQuery();
        return ctx.reply('Balance feature coming soon!');
      case 'send_money':
        await ctx.answerCbQuery();
        return ctx.reply('Send Money feature coming soon!');
      case 'deposit':
        await ctx.answerCbQuery();
        return ctx.reply('Deposit feature coming soon!');
      case 'transactions':
        await ctx.answerCbQuery();
        return ctx.reply('Transactions feature coming soon!');
      default:
        await ctx.answerCbQuery('Unknown action');
    }
  };
// src/handlers/authHandler.ts
import { Context, Markup } from 'telegraf';
import { authService } from '../services/authService';
import { getMainMenuKeyboard } from '../keyboards/mainMenu';

export const authHandler = {
  /**
   * Handle connect account button click
   */
  handleConnectAccount: async (ctx: Context) => {
    const telegramId = ctx.from?.id;
    
    if (!telegramId) {
      await ctx.reply('Error: Could not identify user.');
      return;
    }

    console.log(`Connecting account for user ${telegramId}`);

    // TODO: remove
    // Create mock user data
    const mockUserData = {
      userId: `user-${telegramId}`,
      name: 'Test User',
      email: 'testuser@example.com',
      apiToken: 'mock-token-123'
    };

    // Save mock user session
    authService.saveUserSession(telegramId, mockUserData);

    // Answer the callback query to stop the "loading" state
    if (ctx.callbackQuery) {
      await ctx.answerCbQuery();
    }
    
    // Show success message and main menu
    await ctx.reply(
      `Account connected successfully! Welcome to Copperx Payout, ${mockUserData.name}!`,
      getMainMenuKeyboard()
    );
    
    // Generate auth link
    // const authLink = authService.generateAuthLink(telegramId);
    
    // await ctx.reply(
    //   'Please click the button below to connect your Copperx account:',
    //   Markup.inlineKeyboard([
    //     Markup.button.url('Connect Account', authLink)
    //   ])
    // );
  },
  
  /**
   * Handle logout button click
   */
  handleLogout: async (ctx: Context) => {
    const telegramId = ctx.from?.id;
    
    if (!telegramId) {
      await ctx.reply('Error: Could not identify user.');
      return;
    }
    
    // Remove user session
    authService.removeUserSession(telegramId);

    // Answer the callback query
    if (ctx.callbackQuery) {
      await ctx.answerCbQuery();
    }
    
    await ctx.reply(
      'You have been logged out. Use /start to connect your account again.'
    );
  },
  
  /**
   * Complete authorization (called via webhook or deep link)
   */
  completeAuth: async (ctx: Context, token: string) => {
    const telegramId = ctx.from?.id;
    
    if (!telegramId) {
      await ctx.reply('Error: Could not identify user.');
      return;
    }
    
    // Verify token with API
    const userData = await authService.verifyToken(token);
    
    if (userData) {
      // Save user session
      authService.saveUserSession(telegramId, userData);
      
      await ctx.reply(
        `Account connected successfully! Welcome to Copperx Payout, ${userData.name || 'User'}!`,
        getMainMenuKeyboard()
      );
    } else {
      await ctx.reply(
        'Failed to connect account. Please try again.'
      );
    }
  }
};
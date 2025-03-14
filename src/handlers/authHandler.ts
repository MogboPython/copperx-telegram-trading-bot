// src/handlers/authHandler.ts
import { Markup } from 'telegraf';
import { MyContext } from '../types/context';
import { AUTH_SCENES } from '../constants/authConstants';
import { copperxApi } from '../services/copperxApi';
import { sessionManager } from '../services/sessionManager';
import { getMainMenuKeyboard } from '../keyboards/mainMenu';
import { getAuthKeyboard } from '../keyboards/authMenu';

export const authHandler = {
  /**
   * Handle connect account button click
   */
  handleConnectAccount: async (ctx: MyContext) => {
    const telegramId = ctx.from?.id;
    
    if (!telegramId) {
      await ctx.reply('Error: Could not identify user.');
      return;
    }

    await ctx.reply(
      'Please enter your Copperx email address to receive an OTP:',
      Markup.forceReply()
    );

    // Set user in email input stage
    ctx.scene.enter(AUTH_SCENES.EMAIL_INPUT);

    // TODO: remove
    console.log(`Connecting account for user ${telegramId}`);
  },

  /**
   * Handle email input
   */
  handleEmailInput: async (ctx: MyContext) => {
    const telegramId = ctx.from?.id;
    
    if (!telegramId || !ctx.message || !('text' in ctx.message)) {
      await ctx.reply('Error: Invalid input. Please try again.');
      return;
    }
    
    const email = ctx.message.text.trim();
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      await ctx.reply(
        'Please enter a valid email address:',
        Markup.forceReply()
      );
      return;
    }
    
    try {
      // Request OTP
      await ctx.reply(`Requesting OTP for ${email}...`);
      const otpResponse = await copperxApi.requestEmailOtp({ email });
      
      // Store OTP session ID
      sessionManager.startOtpFlow(telegramId, email, otpResponse.sid);
      
      await ctx.reply(
        `OTP has been sent to ${email}. Please enter the OTP code below:`,
        Markup.forceReply()
      );
      
      // Move to OTP input stage
      ctx.scene.enter(AUTH_SCENES.OTP_INPUT);
    } catch (error) {
      console.error('OTP request error:', error);
      await ctx.reply(
        'Failed to request OTP. Please try again later or contact support.',
        getAuthKeyboard()
      );
      ctx.scene.leave();
    }
  },

  /**
   * Handle OTP input
   */
  handleOtpInput: async (ctx: MyContext) => {
    const telegramId = ctx.from?.id;
    
    if (!telegramId || !ctx.message || !('text' in ctx.message)) {
      await ctx.reply('Error: Invalid input. Please try again.');
      return;
    }
    
    const otp = ctx.message.text.trim();
    const otpDetails = sessionManager.getOtpDetails(telegramId);
    
    if (!otpDetails) {
      await ctx.reply(
        'Session expired. Please start again.',
        getAuthKeyboard()
      );
      ctx.scene.leave();
      return;
    }
    
    try {
      // Verify OTP
      await ctx.reply('Verifying OTP...');
      const authResponse = await copperxApi.authenticateWithEmailOtp({
        email: otpDetails.email,
        otp,
        sid: otpDetails.sid
      });
      
      // Create user session
      sessionManager.createSession(telegramId, authResponse);
      sessionManager.clearOtpDetails(telegramId);
      
      await ctx.reply(
        `Welcome to Copperx Payout, ${authResponse.user.firstName}!`,
        getMainMenuKeyboard()
      );
      
      // Exit the scene
      ctx.scene.leave();
    } catch (error) {
      console.error('OTP verification error:', error);
      await ctx.reply(
        'Invalid OTP or the code has expired. Please try again.',
        getAuthKeyboard()
      );
      ctx.scene.leave();
    }
  },
  
  /**
   * Handle logout button click
   */
    handleLogout: async (ctx: MyContext) => {
      const telegramId = ctx.from?.id;
      
      if (!telegramId) {
        await ctx.reply('Error: Could not identify user.');
        return;
      }
      
      // Clear API token
      copperxApi.clearAuthToken();
      
      // Remove user session
      sessionManager.removeSession(telegramId);
      
      // Answer the callback query
      if (ctx.callbackQuery) {
        await ctx.answerCbQuery('Logged out successfully');
      }
      
      await ctx.reply(
        'You have been logged out. Use /start to connect your account again.'
      );
    }

  // handleLogout: async (ctx: MyContext) => {
  //   const telegramId = ctx.from?.id;
    
  //   if (!telegramId) {
  //     await ctx.reply('Error: Could not identify user.');
  //     return;
  //   }
    
  //   authService.removeUserSession(telegramId);

  //   if (ctx.callbackQuery) {
  //     await ctx.answerCbQuery();
  //   }
    
  //   await ctx.reply(
  //     'You have been logged out. Use /start to connect your account again.'
  //   );
  // },

  // completeAuth: async (ctx: MyContext, token: string) => {
  //   const telegramId = ctx.from?.id;
    
  //   if (!telegramId) {
  //     await ctx.reply('Error: Could not identify user.');
  //     return;
  //   }
    
  //   const userData = await authService.verifyToken(token);
    
  //   if (userData) {
  //     authService.saveUserSession(telegramId, userData);
      
  //     await ctx.reply(
  //       `Account connected successfully! Welcome to Copperx Payout, ${userData.name || 'User'}!`,
  //       getMainMenuKeyboard()
  //     );
  //   } else {
  //     await ctx.reply(
  //       'Failed to connect account. Please try again.'
  //     );
  //   }
  // }
};
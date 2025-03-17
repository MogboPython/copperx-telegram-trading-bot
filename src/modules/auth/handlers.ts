import { Composer } from "grammy";
import { MyContext, isAuthenticated } from "../../utils/sessions";
import { authService } from "./service";
import { connectAccountKeyboard, mainMenuKeyboard } from "../../bot/keyboards";
import { getWelcomeMessage, getSuccessMessage, getErrorMessage } from "../../utils/message";
import { getRemainingAttempts } from "../../utils/rate-limiter";

// Create a composer for auth-related commands
const composer = new Composer<MyContext>();

// Handler for email input
composer.on("message:text").filter(ctx => 
  ctx.session.currentAction === "waiting_for_email"
).on("message:text", async (ctx) => {
    if (!ctx.chat || !ctx.from) {
        console.error("Chat or user context is undefined");
        return;
    }
    
    const email = ctx.message.text.trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    if (!emailRegex.test(email)) {
      return await ctx.reply("Please enter a valid email address:");
    }
    
    // Show loading message
    const loadingMsg = await ctx.reply("Sending OTP to your email...");
    
    try {
      // Request OTP
      console.log('Sending OTP to', email);
      const otpResult = await authService.requestEmailOtp(ctx, email);
      
      if (otpResult && otpResult.sid) {
        // Store the email and sid in the session
        ctx.session.tempData = {
          email: otpResult.email,
          sid: otpResult.sid
        };
        
        // Update the current action
        ctx.session.currentAction = "waiting_for_otp";
        
        await ctx.api.deleteMessage(ctx.chat.id, loadingMsg.message_id);
        await ctx.reply(
          `We've sent a one-time password to ${email}. Please enter the OTP.`
        );
      } else {
        await ctx.api.deleteMessage(ctx.chat.id, loadingMsg.message_id);
        
        const attemptsLeft = getRemainingAttempts(ctx.from.id);
        if (attemptsLeft > 0) {
          await ctx.reply(
            getErrorMessage(`Failed to send OTP. Please try again. You have ${attemptsLeft} attempts remaining.`),
            { reply_markup: connectAccountKeyboard, parse_mode: "Markdown" }
          );
        } else {
          await ctx.reply(
            getErrorMessage("Too many failed attempts. Please try again later."),
            { reply_markup: connectAccountKeyboard, parse_mode: "Markdown" }
          );
        }
        
        ctx.session.currentAction = undefined;
      }
    } catch (error) {
      console.error("Error requesting OTP:", error);
      await ctx.api.deleteMessage(ctx.chat.id, loadingMsg.message_id);
      
      const attemptsLeft = getRemainingAttempts(ctx.from.id);
      if (attemptsLeft > 0) {
        await ctx.reply(
          getErrorMessage(`An error occurred. Please try again. You have ${attemptsLeft} attempts remaining.`),
          { reply_markup: connectAccountKeyboard, parse_mode: "Markdown" }
        );
      } else {
        await ctx.reply(
          getErrorMessage("Too many failed attempts. Please try again later."),
          { reply_markup: connectAccountKeyboard, parse_mode: "Markdown" }
        );
      }
      
      ctx.session.currentAction = undefined;
    }
});

// Handler for OTP input
composer.on("message:text").filter(ctx => 
  ctx.session.currentAction === "waiting_for_otp"
).on("message:text", async (ctx) => {
  if (!ctx.chat || !ctx.from) {
    console.error("Chat or user context is undefined");
    return;
  }
  
  const otp = ctx.message.text.trim();
  
  if (!ctx.session.tempData?.email || !ctx.session.tempData?.sid) {
    return await ctx.reply(
      getErrorMessage("Session expired. Please try again."),
      { reply_markup: connectAccountKeyboard, parse_mode: "Markdown" }
    );
  }
  
  // Show loading message
  const loadingMsg = await ctx.reply("Verifying OTP...");
  
  try {
    // Authenticate with OTP
    console.log('Authenticating OTP');
    const success = await authService.authenticateWithOtp(
      ctx,
      ctx.session.tempData.email,
      otp,
      ctx.session.tempData.sid
    );
    
    // Clear the temp data and current action
    ctx.session.tempData = {};
    ctx.session.currentAction = undefined;
    
    if (success) {
      await ctx.api.deleteMessage(ctx.chat.id, loadingMsg.message_id);
      await ctx.reply(
        getWelcomeMessage(ctx) + "\n\n" + 
        getSuccessMessage("Your account has been successfully connected!"), 
        {
          reply_markup: mainMenuKeyboard,
          parse_mode: "Markdown"
        }
      );
    } else {
      await ctx.api.deleteMessage(ctx.chat.id, loadingMsg.message_id);
      
      const attemptsLeft = getRemainingAttempts(ctx.from.id);
      if (attemptsLeft > 0) {
        await ctx.reply(
          getErrorMessage(`Authentication failed. Please try again. You have ${attemptsLeft} attempts remaining.`),
          { reply_markup: connectAccountKeyboard, parse_mode: "Markdown" }
        );
      } else {
        await ctx.reply(
          getErrorMessage("Too many failed attempts. Please try again later."),
          { reply_markup: connectAccountKeyboard, parse_mode: "Markdown" }
        );
      }
    }
  } catch (error) {
    console.error("Error authenticating:", error);
    await ctx.api.deleteMessage(ctx.chat.id, loadingMsg.message_id);
    
    const attemptsLeft = getRemainingAttempts(ctx.from.id);
    if (attemptsLeft > 0) {
      await ctx.reply(
        getErrorMessage(`An error occurred during authentication. Please try again. You have ${attemptsLeft} attempts remaining.`),
        { reply_markup: connectAccountKeyboard, parse_mode: "Markdown" }
      );
    } else {
      await ctx.reply(
        getErrorMessage("Too many failed attempts. Please try again later."),
        { reply_markup: connectAccountKeyboard, parse_mode: "Markdown" }
      );
    }
  }
});

// Handler function for logout command and button
export const handleLogoutAction = async (ctx: MyContext) => {
    if (isAuthenticated(ctx)) {
        authService.logout(ctx);
        await ctx.reply(
        "You have been logged out. Connect again when you're ready!",
        { reply_markup: connectAccountKeyboard }
        );
    } else {
        await ctx.reply(
        "You're not currently logged in.",
        { reply_markup: connectAccountKeyboard }
        );
    }
};

export default composer;
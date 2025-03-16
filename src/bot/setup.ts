import { bot } from "./bot";
import { commands } from "./commands";
import { getWelcomeMessage } from "../utils/message";
import { mainMenuKeyboard } from "./keyboards";
import { handleLogoutAction } from "../modules/auth/handlers";
import { handleProfileAction } from "../modules/profile/handlers";
import { handleKYCAction } from "../modules/kyc/handlers";
import { authRateLimiter } from "../utils/rate-limiter";

// Import module handlers
import authHandlers from "../modules/auth/handlers";
// import profileHandlers from "../modules/profile/handlers";

export function setupBot(sessionMiddleware: any) {
  // Set bot commands
  bot.api.setMyCommands(commands);
  
  // Middleware
  bot.use(sessionMiddleware);
  
  // Add rate limiting middleware
  bot.use(authRateLimiter);
  
  // Error handling
  bot.catch((err) => {
    console.error("Bot error:", err);
  });
  
  // module handlers
  bot.use(authHandlers);
  // bot.use(profileHandlers);
  
  
  // Handler for the back_to_main button
  bot.callbackQuery("back_to_main", async (ctx) => {
    await ctx.answerCallbackQuery();
    await ctx.reply(
      getWelcomeMessage(ctx), 
      {
        reply_markup: mainMenuKeyboard,
        parse_mode: "Markdown"
      }
    );
  });

  // Map inline button callbacks to command handlers
  bot.callbackQuery(/^menu_(.+)$/, async (ctx) => {
    if (!ctx.chat) {
      console.error("Chat context is undefined");
      return;
    }
    
    await ctx.answerCallbackQuery();
    
    const action = ctx.match[1];
    switch (action) {
      case 'profile':
        await ctx.reply("Loading profile...");
        await handleProfileAction(ctx);
        break;
      
      case 'kyc':
        await ctx.reply("Loading KYC...");
        await handleKYCAction(ctx);
        break;
      
      case 'wallets':
        await ctx.reply("Wallets feature is coming soon!");
        break;
      
      case 'balance':
        await ctx.reply("Balance feature is coming soon!");
        break;
      
      case 'send':
        await ctx.reply("Send money feature is coming soon!");
        break;
      
      case 'deposit':
        await ctx.reply("Deposit feature is coming soon!");
        break;
      
      case 'transactions':
        await ctx.reply("Transactions feature is coming soon!");
        break;
      
      case 'logout':
        await handleLogoutAction(ctx);
        break;
      
      default:
        await ctx.reply("Unknown command. Please try again.");
        break;
    }
  });
  
  // Handler for unhandled messages
  bot.on("message", async (ctx) => {
    await ctx.reply("I don't understand that command. Please use the menu buttons or /help for assistance.");
  });
  
  return bot;
}
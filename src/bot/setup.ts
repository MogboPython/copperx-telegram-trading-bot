import { bot } from "./bot";
import { commands } from "./commands";
import { handleLogoutAction } from "../modules/auth/handlers";
import { handleProfileAction } from "../modules/profile/handlers";
import { handleKYCAction } from "../modules/kyc/handlers";
import { handleWalletsAction } from "../modules/wallet/handlers";
import { authRateLimiter } from "../utils/rate-limiter";

// Import module handlers
import homeHandlers from "../modules/home/handlers";
import authHandlers from "../modules/auth/handlers";
import walletHandlers from "../modules/wallet/handlers";

export function setupBot(sessionMiddleware: any) {
  // Error handling
  bot.catch((err) => {
    console.error("Bot error:", err);
  });

  // Set bot commands
  bot.api.setMyCommands(commands);
  
  // Middleware
  bot.use(sessionMiddleware);
  
  // Add rate limiting middleware
  bot.use(authRateLimiter);
  
  // module handlers
  bot.use(authHandlers);
  bot.use(homeHandlers);
  bot.use(walletHandlers);

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
        // TODO: remove these
        await ctx.reply("Loading profile...");
        await handleProfileAction(ctx);
        break;
      
      case 'kyc':
        await ctx.reply("Loading KYC...");
        await handleKYCAction(ctx);
        break;
      
      case 'wallets':
        await ctx.reply("Loading Wallet info...");
        await handleWalletsAction(ctx);
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
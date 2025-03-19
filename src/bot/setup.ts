import { bot } from "./bot";
import { commands } from "./commands";
import { handleLogoutAction } from "../modules/auth/handlers";
import { handleProfileAction } from "../modules/profile/handlers";
import { handleKYCAction } from "../modules/kyc/handlers";
import { handleWalletsAction, handleWalletBalances } from "../modules/wallet/handlers";
import { handleSendAction, handleDepositAction } from '../modules/transfers/handlers'
import { handleTransactionsAction } from '../modules/transactions/handlers';
import { authRateLimiter } from "../utils/rate-limiter";

// Import module handlers
import homeHandlers from "../modules/home/handlers";
import authHandlers from "../modules/auth/handlers";
import walletHandlers from "../modules/wallet/handlers";
import txHandlers from '../modules/transactions/handlers';
import transferHandlers from '../modules/transfers/handlers'

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
  bot.use(txHandlers);
  bot.use(transferHandlers);

    // const loadingMsg = await ctx.reply("Verifying OTP...");
    // await ctx.api.deleteMessage(ctx.chat.id, loadingMsg.message_id);

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
        await handleProfileAction(ctx);
        break;
      
      case 'kyc':
        await handleKYCAction(ctx);
        break;
      
      case 'wallets':
        await handleWalletsAction(ctx);
        break;
      
      case 'balance':
        await handleWalletBalances(ctx);
        break;
      
      case 'send':
        await handleSendAction(ctx);
        break;
      
      case 'deposit':
        await handleDepositAction(ctx);
        break;
      
      case 'transactions':
        await handleTransactionsAction(ctx);
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
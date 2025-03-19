import { Composer } from "grammy";
import { MyContext, isAuthenticated } from "../../utils/sessions";
import { connectAccountKeyboard, mainMenuKeyboard } from "../../bot/keyboards";
import { getWelcomeMessage } from "../../utils/message";

const composer = new Composer<MyContext>();

composer.callbackQuery("home", async (ctx) => {
  await ctx.answerCallbackQuery();

  if (isAuthenticated(ctx)) {
    const firstName = ctx.session.firstName || 'Esteemed User';
    await ctx.reply(
      `Hello, ${firstName}! To use your account, select any of the following options:`, 
      {
          reply_markup: mainMenuKeyboard,
          parse_mode: "Markdown"
      }
    );
  } else {
      await ctx.reply(
      "You're not currently logged in.",
      { reply_markup: connectAccountKeyboard }
      );
  }    
});

// Handler for /start command
composer.command("start", async (ctx) => {
  const chatId = ctx.chat?.id;
  const userId = ctx.from?.id;
  
  if (!chatId || !userId) {
    return await ctx.reply("Error: Could not identify user.");
  }

  // Check if user is already authenticated
  if (isAuthenticated(ctx)) {
    const firstName = ctx.session.firstName || 'Esteemed User';
    await ctx.reply(
        `Welcome to CopperX TG Bot - the fastest and most secure bot for managing your account!\n\n` +
        `Hello, ${firstName}! To use your account, select any of the following options:`, 
        {
            reply_markup: mainMenuKeyboard,
            parse_mode: "Markdown"
        }
    );
  } else {
    // User is not authenticated, show connect button
    await ctx.reply(
      `What can this bot do?\n\n` +
      `Blazingly-fast payments and wallet management at your fingertips with CopperX. Use /start to open the main menu and ` +
      `start using all our features - quick transfers, wallet tracking, balance checking and more.\n\n` +
      `Website: https://copperx.io/\n` +
      `Twitter: https://x.com/copperxhq\n` +
      `Telegram: https://t.me/copperxcommunity`,
      { 
        reply_markup: connectAccountKeyboard,
        parse_mode: "Markdown",
      }
    );
  }
});

composer.command("chat", async (ctx) => {
  await ctx.reply("Join the discussion, share bugs and feature requests in our Telegram group: https://t.me/copperxcommunity");
});

// Handler for /help command
composer.command("help", async (ctx) => {
  if (!ctx.chat) {
    console.error("Chat context is undefined");
    return;
  }

  const helpMessage = `
🔍 *CopperX Bot Help*

Welcome to the CopperX Telegram Bot! Here's how to use the available commands:

*Authentication*
/start - Begin using the bot and connect your account
/logout - Disconnect your account from the bot

*Account Information*
/profile - View your personal profile details
/kyc - Check your KYC verification status

*Wallet Management*
/wallets - Access your wallet management menu
/balance - Check wallet balances

*Transactions*
/transactions - View your recent transactions

*Support*
/help - Display this help message

Need further assistance? Visit our support center at https://support.copperx.io
`;

  await ctx.reply(helpMessage, {
    parse_mode: "Markdown",
  });
});

// Handler for connect_account button
composer.callbackQuery("connect_account", async (ctx) => {
    await ctx.answerCallbackQuery();
    await ctx.reply("Please enter your email address to receive a one-time password:");
    
    // Set the current action to email input
    ctx.session.currentAction = "waiting_for_email";
});

  // Handler for the back_to_main button
composer.callbackQuery("back_to_main", async (ctx) => {
    await ctx.answerCallbackQuery();
    await ctx.reply(
        getWelcomeMessage(ctx), 
        {
        reply_markup: mainMenuKeyboard,
        parse_mode: "Markdown"
        }
    );
});

export default composer;
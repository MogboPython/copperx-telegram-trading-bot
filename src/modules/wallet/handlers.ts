import { Composer } from "grammy";
import { MyContext, isAuthenticated } from "../../utils/sessions";
import { connectAccountKeyboard, walletsMenuKeyboard, createSetDefaultWalletKeyboard, backToMainKeyboard, txActionsMenuKeyboard  } from "../../bot/keyboards";
import { getErrorMessage } from "../../utils/message";
import { walletService } from "./service";

// Create a composer for wallet-related commands
const composer = new Composer<MyContext>();

// Handler function for wallets menu
export const handleWalletsAction = async (ctx: MyContext) => {
  if (!ctx.chat) {
    console.error("Chat context is undefined");
    return;
  }

  if (!isAuthenticated(ctx)) {
    return await ctx.reply(
      "You need to connect your account first.",
      { reply_markup: connectAccountKeyboard }
    );
  }

  await ctx.reply(
    "🏦 *Wallet Management*\n\nManage your digital wallets and check balances.",
    { 
      parse_mode: "Markdown",
      reply_markup: walletsMenuKeyboard 
    }
  );
};

export const handleAllWallets = async (ctx: MyContext) => {
    if (!ctx.chat) {
      console.error("Chat context is undefined");
      return;
    }
  
    if (!isAuthenticated(ctx)) {
      return await ctx.reply(
        "You need to connect your account first.",
        { reply_markup: connectAccountKeyboard }
      );
    }
    
    const loadingMsg = await ctx.reply("Fetching all your wallets...");
  
    try {
      // Get all wallets
      const wallets = await walletService.getAllWallets(ctx);
      
      await ctx.api.deleteMessage(ctx.chat.id, loadingMsg.message_id);
      
      if (wallets && wallets.length > 0) {
        const walletsInfo = await walletService.formatWalletDetails(wallets);
        
        await ctx.reply(
            walletsInfo,
            { 
                parse_mode: 'Markdown',
                reply_markup: backToMainKeyboard 
            }
        );
      } else {
        await ctx.reply(
          "You don't have any wallets yet.",
          { reply_markup: walletsMenuKeyboard }
        );
      }
    } catch (error) {
      console.error("Error fetching wallets:", error);
      await ctx.reply(
        getErrorMessage("An error occurred while fetching your wallets. Please try again later."),
        { 
          parse_mode: "Markdown",
          reply_markup: walletsMenuKeyboard 
        }
      );
    }
  };

// Handler function for set default wallet
export const handleSetDefaultWallet = async (ctx: MyContext) => {
    if (!ctx.chat) {
      console.error("Chat context is undefined");
      return;
    }
  
    if (!isAuthenticated(ctx)) {
      return await ctx.reply(
        "You need to connect your account first.",
        { reply_markup: connectAccountKeyboard }
      );
    }
  
    // Show loading message
    const loadingMsg = await ctx.reply("Fetching your wallets...");
  
    try {
      const wallets = await walletService.getAllWallets(ctx);
      
      await ctx.api.deleteMessage(ctx.chat.id, loadingMsg.message_id);
      
      if (wallets && wallets.length > 0) {
        await ctx.reply(
          "🔄 *Set Default Wallet*\n\nSelect which wallet to set as your default:",
          { 
            parse_mode: "Markdown",
            reply_markup: createSetDefaultWalletKeyboard(wallets.map(w => ({ id: w.id, name: w.name, address: w.walletAddress })))
          }
        );
      } else {
        await ctx.reply(
          "You don't have any wallets to set as default.",
          { reply_markup: walletsMenuKeyboard }
        );
      }
    } catch (error) {
      console.error("Error fetching wallets for default selection:", error);
      
      await ctx.api.deleteMessage(ctx.chat.id, loadingMsg.message_id);
      await ctx.reply(
        getErrorMessage("An error occurred while fetching your wallets. Please try again later."),
        { 
          parse_mode: "Markdown",
          reply_markup: walletsMenuKeyboard 
        }
      );
    }
  };

export const handleSetDefaultWalletResponse = async (ctx: MyContext, walletId: string) => {
    if (!ctx.chat) {
        console.error("Chat context is undefined");
        return;
    }
    
    const loadingMsg = await ctx.reply("Setting default wallet...");
    
    try {
        const success = await walletService.setDefaultWallet(ctx, walletId);
        
        await ctx.api.deleteMessage(ctx.chat.id, loadingMsg.message_id);
        
        if (success) {
            await ctx.reply("Your default wallet was successfully changed", { 
                parse_mode: "Markdown",
                reply_markup: walletsMenuKeyboard 
            });
        } else {
            await ctx.reply(
            getErrorMessage("Unable to set default wallet. The server may be experiencing issues."),{ 
                parse_mode: "Markdown",
                reply_markup: walletsMenuKeyboard 
            });
        }
    } catch (error) {
        console.error("Error setting default wallet:", error);
      
        await ctx.api.deleteMessage(ctx.chat.id, loadingMsg.message_id);
        await ctx.reply(
            getErrorMessage("An error occurred while setting default wallet. Please try again later."),
            { 
            parse_mode: "Markdown",
            reply_markup: walletsMenuKeyboard 
            }
        );
    }
}

// Handler function for wallet balances
export const handleWalletBalances = async (ctx: MyContext) => {
  if (!ctx.chat) {
    console.error("Chat context is undefined");
    return;
  }

  if (!isAuthenticated(ctx)) {
    return await ctx.reply(
      "You need to connect your account first.",
      { reply_markup: connectAccountKeyboard }
    );
  }

  // Show loading message
  const loadingMsg = await ctx.reply("Fetching your wallet balances...");

  try {
    // Get wallet balances
    const balances = await walletService.getWalletBalances(ctx);
    
    await ctx.api.deleteMessage(ctx.chat.id, loadingMsg.message_id);
    
    if (balances && balances.length > 0) {
      // Format and display balances
      const balancesInfo = walletService.formatWalletBalanceDetails(balances);
      
      await ctx.reply(balancesInfo, {
        parse_mode: "Markdown",
        reply_markup: txActionsMenuKeyboard
      });
    } else {
      await ctx.reply(
        "You don't have any wallet balances yet.",
        { reply_markup: walletsMenuKeyboard }
      );
    }
  } catch (error) {
    console.error("Error fetching wallet balances:", error);
    
    await ctx.api.deleteMessage(ctx.chat.id, loadingMsg.message_id);
    await ctx.reply(
      getErrorMessage("An error occurred while fetching your wallet balances. Please try again later."),
      { 
        parse_mode: "Markdown",
        reply_markup: walletsMenuKeyboard 
      }
    );
  }
};

composer.callbackQuery("wallet_all", async (ctx) => {
  await ctx.answerCallbackQuery();
  await handleAllWallets(ctx);
});

composer.callbackQuery("wallet_set_default", async (ctx) => {
  await ctx.answerCallbackQuery();
  await handleSetDefaultWallet(ctx);
});

composer.callbackQuery(/^wallet_make_default_(.+)$/, async (ctx) => {
    await ctx.answerCallbackQuery();
    const walletId = ctx.match[1];
    await handleSetDefaultWalletResponse(ctx, walletId);
});

// Add this callback handler for the refresh button
composer.callbackQuery("refresh_balance", async (ctx) => {
    if (!ctx.callbackQuery.message) {
      await ctx.answerCallbackQuery("Cannot refresh this message");
      return;
    }
  
    // Show loading state via callback answer
    await ctx.answerCallbackQuery("Refreshing balances...");
  
    try {
      // Get updated wallet balances
      const balances = await walletService.getWalletBalances(ctx);
      
      if (balances && balances.length > 0) {
        // Format updated balances
        const balancesInfo = walletService.formatWalletBalanceDetails(balances);
        
        // Edit the current message instead of sending a new one
        await ctx.editMessageText(balancesInfo, {
          parse_mode: "Markdown",
          reply_markup: txActionsMenuKeyboard
        });
      } else {
        await ctx.answerCallbackQuery("No balances found");
      }
    } catch (error) {
      console.error("Error refreshing balances:", error);
      await ctx.answerCallbackQuery("Failed to refresh balances");
    }
  });

export default composer;
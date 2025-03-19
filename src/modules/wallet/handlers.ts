import { Composer } from "grammy";
import { MyContext, isAuthenticated } from "../../utils/sessions";
import { connectAccountKeyboard, walletsMenuKeyboard, createSetDefaultWalletKeyboard, backToMainKeyboard, txActionsMenuKeyboard, sendMenuKeyboard } from "../../bot/keyboards";
import { getErrorMessage } from "../../utils/message";
import { walletService, getNetworkNameFromCode } from "./service";

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

export const handleSendAction = async (ctx: MyContext) => {
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

  await ctx.editMessageText(
    "💰 *Send Money*\n\nSending your tokens has never been easier. Select how you want to send:", 
    {
      parse_mode: "Markdown",
      reply_markup: sendMenuKeyboard
    });
};

export const handleDepositAction = async (ctx: MyContext) => {
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

  const wallet = await walletService.getDefaultWallet(ctx);
  const address = `\`${wallet?.walletAddress}\`` || "Default address not set";
  const network = `${getNetworkNameFromCode(wallet?.network||"")}`

  await ctx.reply(`To deposit send USDC to your default address:`);
  await ctx.reply(
    `${network} ${address}`,
    { 
      parse_mode: "Markdown"
    }
  );
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

composer.callbackQuery("send_to_email", async (ctx) => {
    await ctx.answerCallbackQuery();
    await ctx.reply("Send money feature is coming soon!");
});

composer.callbackQuery("send_to_wallet", async (ctx) => {
  await ctx.answerCallbackQuery();
  await ctx.reply("Send money feature is coming soon!");
});

composer.callbackQuery("send_to_bank", async (ctx) => {
  await ctx.answerCallbackQuery();
  await ctx.reply("Send money feature is coming soon!");
});

// composer.callbackQuery("back_to_wallet_menu", async (ctx) => {
//     await ctx.answerCallbackQuery();
//     await ctx.reply('', {
//             parse_mode: "Markdown",
//             reply_markup: walletsMenuKeyboard
//         }
//     );
// });

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

// composer.callbackQuery("back_to_wallets", async (ctx) => {
//   await ctx.answerCallbackQuery();
//   await handleBackToWallets(ctx);
// });

// Handler for viewing specific wallet
// composer.callbackQuery(/^wallet_view_(.+)$/, async (ctx) => {
//   await ctx.answerCallbackQuery();
  
//   if (!ctx.chat) {
//     console.error("Chat context is undefined");
//     return;
//   }
  
//   const walletId = ctx.match[1];
  
//   // Show loading message
//   const loadingMsg = await ctx.reply("Fetching wallet details...");
  
//   try {
//     const wallet = await walletService.getWalletById(ctx, walletId);
    
//     await ctx.api.deleteMessage(ctx.chat.id, loadingMsg.message_id);
    
//     if (wallet) {
//       const walletText = walletService.formatWalletDetails(wallet);
      
//       await ctx.reply(walletText, {
//         parse_mode: "Markdown",
//         reply_markup: createWalletDetailsKeyboard(walletId)
//       });
//     } else {
//       await ctx.reply(
//         getErrorMessage("Wallet not found. Please try again."),
//         { 
//           parse_mode: "Markdown",
//           reply_markup: walletsMenuKeyboard 
//         }
//       );
//     }
//   } catch (error) {
//     console.error("Error fetching wallet details:", error);
    
//     await ctx.api.deleteMessage(ctx.chat.id, loadingMsg.message_id);
//     await ctx.reply(
//       getErrorMessage("An error occurred while fetching wallet details. Please try again later."),
//       { 
//         parse_mode: "Markdown",
//         reply_markup: walletsMenuKeyboard 
//       }
//     );
//   }
// });

// Handler for setting default wallet from list
// composer.callbackQuery(/^wallet_make_default_(.+)$/, async (ctx) => {
//   await ctx.answerCallbackQuery();
  
//   if (!ctx.chat) {
//     console.error("Chat context is undefined");
//     return;
//   }
  
//   const walletId = ctx.match[1];
  
//   // Show loading message
//   const loadingMsg = await ctx.reply("Setting default wallet...");
  
//   try {
//     const success = await walletService.setDefaultWallet(ctx, walletId);
    
//     await ctx.api.deleteMessage(ctx.chat.id, loadingMsg.message_id);
    
//     if (success) {
//       await ctx.reply(
//         "✅ Default wallet has been successfully updated!",
//         { reply_markup: walletsMenuKeyboard }
//       );
//     } else {
//       await ctx.reply(
//         getErrorMessage("Failed to set default wallet. Please try again."),
//         { 
//           parse_mode: "Markdown",
//           reply_markup: walletsMenuKeyboard 
//         }
//       );
//     }
//   } catch (error) {
//     console.error("Error setting default wallet:", error);
    
//     await ctx.api.deleteMessage(ctx.chat.id, loadingMsg.message_id);
//     await ctx.reply(
//       getErrorMessage("An error occurred while setting default wallet. Please try again later."),
//       { 
//         parse_mode: "Markdown",
//         reply_markup: walletsMenuKeyboard 
//       }
//     );
//   }
// });

// Set a specific wallet as default directly from wallet details
// composer.callbackQuery(/^wallet_set_default_(.+)$/, async (ctx) => {
//   await ctx.answerCallbackQuery();
  
//   if (!ctx.chat) {
//     console.error("Chat context is undefined");
//     return;
//   }
  
//   const walletId = ctx.match[1];
  
//   // Show loading message
//   const loadingMsg = await ctx.reply("Setting default wallet...");
  
//   try {
//     const success = await walletService.setDefaultWallet(ctx, walletId);
    
//     await ctx.api.deleteMessage(ctx.chat.id, loadingMsg.message_id);
    
//     if (success) {
//       // Get the updated wallet to display
//       const wallet = await walletService.getWalletById(ctx, walletId);
      
//       if (wallet) {
//         const walletText = walletService.formatWalletDetails(wallet, true);
        
//         await ctx.reply(walletText, {
//           parse_mode: "Markdown",
//           reply_markup: createWalletDetailsKeyboard(walletId)
//         });
//       } else {
//         await ctx.reply(
//           "✅ Default wallet has been successfully updated!",
//           { reply_markup: walletsMenuKeyboard }
//         );
//       }
//     } else {
//       await ctx.reply(
//         getErrorMessage("Failed to set default wallet. Please try again."),
//         { 
//           parse_mode: "Markdown",
//           reply_markup: walletsMenuKeyboard 
//         }
//       );
//     }
//   } catch (error) {
//     console.error("Error setting default wallet:", error);
    
//     await ctx.api.deleteMessage(ctx.chat.id, loadingMsg.message_id);
//     await ctx.reply(
//       getErrorMessage("An error occurred while setting default wallet. Please try again later."),
//       { 
//         parse_mode: "Markdown",
//         reply_markup: walletsMenuKeyboard 
//       }
//     );
//   }
// });

// View wallet transactions
// composer.callbackQuery(/^wallet_transactions_(.+)$/, async (ctx) => {
//   await ctx.answerCallbackQuery();
  
//   if (!ctx.chat) {
//     console.error("Chat context is undefined");
//     return;
//   }
  
//   const walletId = ctx.match[1];
  
//   // Show loading message
//   const loadingMsg = await ctx.reply("Fetching wallet transactions...");
  
//   try {
//     const transactions = await walletService.getWalletTransactions(ctx, walletId);
    
//     await ctx.api.deleteMessage(ctx.chat.id, loadingMsg.message_id);
    
//     if (transactions && transactions.length > 0) {
//       const transactionsText = walletService.formatWalletTransactions(transactions);
      
//       await ctx.reply(transactionsText, {
//         parse_mode: "Markdown",
//         reply_markup: createWalletDetailsKeyboard(walletId)
//       });
//     } else {
//       await ctx.reply(
//         "No transactions found for this wallet.",
//         { reply_markup: createWalletDetailsKeyboard(walletId) }
//       );
//     }
//   } catch (error) {
//     console.error("Error fetching wallet transactions:", error);
    
//     await ctx.api.deleteMessage(ctx.chat.id, loadingMsg.message_id);
//     await ctx.reply(
//       getErrorMessage("An error occurred while fetching wallet transactions. Please try again later."),
//       { 
//         parse_mode: "Markdown",
//         reply_markup: createWalletDetailsKeyboard(walletId) 
//       }
//     );
//   }
// });

export default composer;
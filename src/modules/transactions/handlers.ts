import { Composer } from "grammy";
import { MyContext, isAuthenticated } from "../../utils/sessions";
import { backToMainKeyboard, connectAccountKeyboard } from "../../bot/keyboards";
import { getErrorMessage } from "../../utils/message";
import { transactionService } from "./service";

const composer = new Composer<MyContext>();

// Store transactions in session to reference them later
interface SessionTransactions {
  currentPage: number;
  transactions: any[];
  hasMore: boolean;
}

// Handler for transactions command and button
export const handleTransactionsAction = async (ctx: MyContext) => {
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

  const loadingMsg = await ctx.reply("Fetching your transactions...");

  try {
    // Get transactions (first page)
    const transactionsResponse = await transactionService.getTransactions(ctx);
    
    await ctx.api.deleteMessage(ctx.chat.id, loadingMsg.message_id);
    
    if (transactionsResponse && transactionsResponse.data && transactionsResponse.data.length > 0) {
      // Store transactions in session for reference
      ctx.session.tempData = ctx.session.tempData || {};
      ctx.session.tempData.transactions = {
        currentPage: 1,
        transactions: transactionsResponse.data,
        hasMore: transactionsResponse.hasMore
      } as SessionTransactions;
      
      // Format transactions list
      let message = "📊 *Recent Transactions*\nClick on a transaction number to view details:\n\n";
      
      transactionsResponse.data.forEach((transaction, index) => {
        message += transactionService.formatTransactionList(transaction, index) + "\n\n";
      });
      
      // Add pagination info if there are more pages
      if (transactionsResponse.hasMore) {
        message += "\nUse /more to load more transactions.";
      }
      
      await ctx.reply(message, {
        parse_mode: "Markdown",
        reply_markup: backToMainKeyboard
      });
    } else {
      await ctx.reply(
        "You don't have any transactions yet."
      );
    }
  } catch (error) {
    console.error("Error fetching transactions:", error);
    
    await ctx.api.deleteMessage(ctx.chat.id, loadingMsg.message_id);
    await ctx.reply(
      getErrorMessage("An error occurred while fetching your transactions. Please try again later."),
      { 
        parse_mode: "Markdown",
        reply_markup: backToMainKeyboard 
      }
    );
  }
};

// Handle more transactions button
composer.command("more", async (ctx) => {
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
  
  // Check if we have stored transactions and there are more to load
  if (!ctx.session.tempData?.transactions || 
      !(ctx.session.tempData.transactions as SessionTransactions).hasMore) {
    return await ctx.reply(
      "No more transactions to load.",
      { reply_markup: backToMainKeyboard }
    );
  }
  
  // Show loading message
  const loadingMsg = await ctx.reply("Loading more transactions...");
  
  try {
    const sessionTx = ctx.session.tempData.transactions as SessionTransactions;
    const nextPage = sessionTx.currentPage + 1;
    
    // Get next page of transactions
    const transactionsResponse = await transactionService.getTransactions(ctx, nextPage);
    
    await ctx.api.deleteMessage(ctx.chat.id, loadingMsg.message_id);
    
    if (transactionsResponse && transactionsResponse.data && transactionsResponse.data.length > 0) {
      // Update stored transactions
      const updatedTransactions = [
        ...sessionTx.transactions,
        ...transactionsResponse.data
      ];
      
      ctx.session.tempData.transactions = {
        currentPage: nextPage,
        transactions: updatedTransactions,
        hasMore: transactionsResponse.hasMore
      } as SessionTransactions;
      
      // Format only the new transactions
      let message = "📊 *Additional Transactions*\nClick on a transaction number to view details:\n\n";
      
      transactionsResponse.data.forEach((transaction, index) => {
        const globalIndex = sessionTx.transactions.length + index;
        message += transactionService.formatTransactionList(transaction, globalIndex) + "\n\n";
      });
      
      // Add pagination info if there are more pages
      if (transactionsResponse.hasMore) {
        message += "\nUse /more to load more transactions.";
      }
      
      await ctx.reply(message, {
        parse_mode: "Markdown",
        reply_markup: backToMainKeyboard
      });
    } else {
      await ctx.reply(
        "No more transactions to load.",
        { reply_markup: backToMainKeyboard }
      );
    }
  } catch (error) {
    console.error("Error loading more transactions:", error);
    
    await ctx.api.deleteMessage(ctx.chat.id, loadingMsg.message_id);
    await ctx.reply(
      getErrorMessage("An error occurred while loading more transactions. Please try again later."),
      { 
        parse_mode: "Markdown",
        reply_markup: backToMainKeyboard 
      }
    );
  }
});

// Handle transaction number commands (e.g., /1, /2, etc.)
composer.hears(/^\/(\d+)$/, async (ctx) => {
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
  
  // Extract the transaction index
  const index = parseInt(ctx.match[1]) - 1;
  
  // Check if we have stored transactions and the index is valid
  if (!ctx.session.tempData?.transactions) {
    return await ctx.reply(
      "Please view your transactions list first by using the Transactions button.",
      { reply_markup: backToMainKeyboard }
    );
  }
  
  const sessionTx = ctx.session.tempData.transactions as SessionTransactions;
  
  if (index < 0 || index >= sessionTx.transactions.length) {
    return await ctx.reply(
      "Invalid transaction number. Please select a number from the list.",
      { reply_markup: backToMainKeyboard }
    );
  }
  
  // Get the transaction ID from our stored list
  const transaction = sessionTx.transactions[index];
  
  // Show loading message
  const loadingMsg = await ctx.reply("Fetching transaction details...");
  
  try {
    // Format and display transaction details
    const detailText = transactionService.formatTransactionDetail(transaction);
    
    await ctx.api.deleteMessage(ctx.chat.id, loadingMsg.message_id);
    await ctx.reply(detailText, {
      parse_mode: "Markdown",
      reply_markup: backToMainKeyboard
    });
  } catch (error) {
    console.error("Error fetching transaction details:", error);
    
    await ctx.api.deleteMessage(ctx.chat.id, loadingMsg.message_id);
    await ctx.reply(
      getErrorMessage("An error occurred while fetching transaction details. Please try again later."),
      { 
        parse_mode: "Markdown",
        reply_markup: backToMainKeyboard 
      }
    );
  }
});

export default composer;
import { Composer } from "grammy";
import { MyContext, isAuthenticated } from "../../utils/sessions";
import { connectAccountKeyboard, sendMenuKeyboard, confirmationKeyboard, mainMenuKeyboard } from "../../bot/keyboards";
import { walletService, getNetworkNameFromCode } from "../wallet/service";

const composer = new Composer<MyContext>();

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

// send to email handler
composer.callbackQuery("send_to_email", async (ctx) => {
    await ctx.answerCallbackQuery();
    await ctx.reply("Please enter the CopperX user's email address to send funds to:");

    ctx.session.currentAction = "send_to_email";
});

// send to wallet handler
composer.callbackQuery("send_to_wallet", async (ctx) => {
  await ctx.answerCallbackQuery();
  await ctx.reply("Please enter the wallet address to send funds to:");

  ctx.session.currentAction = "send_to_wallet";
});


composer.callbackQuery("send_to_bank", async (ctx) => {
    await ctx.answerCallbackQuery();
    await ctx.reply("Send to bank feature is coming soon!");
  });

composer.on("message:text").filter(ctx => 
  ctx.session.currentAction === "send_to_email"
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

    // Store the email in the session
    ctx.session.sendToAddress = email;
    
    await ctx.reply("Enter the amount:");
    ctx.session.currentAction = "enter_amount";
});

composer.on("message:text").filter(ctx => 
    ctx.session.currentAction === "send_to_wallet"
  ).on("message:text", async (ctx) => {
      if (!ctx.chat || !ctx.from) {
          console.error("Chat or user context is undefined");
          return;
      }
      
      const walletAddress = ctx.message.text.trim();
  
      ctx.session.sendToAddress = walletAddress;
      
      await ctx.reply("Enter the amount:");
      ctx.session.currentAction = "enter_amount";
      console.log(ctx.session.currentAction);
  });

composer.on("message:text").filter(ctx => 
    ctx.session.currentAction === "enter_amount"
  ).on("message:text", async (ctx) => {
      if (!ctx.chat || !ctx.from) {
          console.error("Chat or user context is undefined");
          return;
      }
      
      const amount = ctx.message.text.trim();
      const numberRegex = /^-?\d+$/;

      // checks that amount is a number
      if (!numberRegex.test(amount)) {
        return await ctx.reply("Please enter a valid number amount:");
      }

      ctx.session.sendAmount = amount;
      
      await ctx.reply(`Are you sure you want to send ${amount} USDC to ${ctx.session.sendToAddress}`,
        {
            reply_markup: confirmationKeyboard
        }
      );
  });

composer.callbackQuery("confirm", async (ctx) => {    
    await ctx.answerCallbackQuery();
    if (ctx.session.currentAction === null){
        return await ctx.reply("No action to perform.");
    }
    
    // Access both values from session
    const email = ctx.session.sendToAddress;
    const amount = ctx.session.sendAmount;
    
    // Send money logic here
    const loadingMsg = await ctx.reply(`Transaction initiated! Sending ${amount} to ${email}.`);
    
    // Clear session data
    ctx.session.currentAction = undefined;
    ctx.session.sendToAddress = undefined;
    ctx.session.sendAmount = undefined;
    setTimeout(async () => {
        if (!ctx.chat) {
            console.error("Chat or user context is undefined");
            return;
        }

        await ctx.api.deleteMessage(ctx.chat.id, loadingMsg.message_id);
        await ctx.reply(
          "Funds sent ✅",
        );
      }, 3000);
  });

composer.callbackQuery("cancel", async (ctx) => {
    if (ctx.session.currentAction === null){
        return await ctx.reply("No action to perform.");
    }

    await ctx.answerCallbackQuery();
    await ctx.reply("Transaction cancelled!");
    
    // Clear session data
    ctx.session.currentAction = undefined;
    ctx.session.sendToAddress = undefined;
    ctx.session.sendAmount = undefined;
  });

export default composer;

// if (ctx.chat) {
//     await ctx.api.deleteMessage(ctx.chat.id, loadingMsg.message_id);
// } else {
//     console.error("Chat context is undefined");
// }

// import { Composer } from "grammy";
import { MyContext, isAuthenticated } from '../../utils/sessions';
import { backToMainKeyboard, connectAccountKeyboard } from "../../bot/keyboards";

import { kycService } from './service';

// const composer = new Composer<MyContext>();

export const handleKYCAction = async (ctx: MyContext) => {
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
  
    const verificationUrl = 'https://payout.copperx.io/app';
    const loadingMsg = await ctx.reply("Fetching your KYC information...");

    try {    
        // Get KYC status
        const kycStatusData = await kycService.getKYCStatus(ctx);
        const isVerified = kycService.isUserVerified(kycStatusData);

        if (kycStatusData && isVerified) {
            // TODO: ad if eventually necessary
            // ctx.session.isVerified = true;
            // Format and display kyc information
            const kycInfo = kycService.formatKycInfo(kycStatusData);
            
            await ctx.api.deleteMessage(ctx.chat.id, loadingMsg.message_id);
            await ctx.reply(kycInfo, {
                parse_mode: "Markdown",
                reply_markup: backToMainKeyboard,
            });
        } else {
            await ctx.api.deleteMessage(ctx.chat.id, loadingMsg.message_id);
            await ctx.reply(
                `KYC verification not done. Please go to ${verificationUrl} to verify your account.`,
                { reply_markup: backToMainKeyboard }
            );
        }
      } catch (error) {
        console.error("Error in KYC handler:", error);
        await ctx.api.deleteMessage(ctx.chat.id, loadingMsg.message_id);
        await ctx.reply(
            "An error occurred while fetching your KYC details. Please try again later.",
            { reply_markup: backToMainKeyboard }
        );
      }
}
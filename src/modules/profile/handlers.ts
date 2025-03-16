import { Composer } from "grammy";
import { MyContext, isAuthenticated } from '../../utils/sessions';
import { profileService } from "./service";
import { backToMainKeyboard, connectAccountKeyboard } from "../../bot/keyboards";

// Create a composer for profile-related commands
const composer = new Composer<MyContext>();

// Handler function for the profile command and button
export const handleProfileAction = async (ctx: MyContext) => {
    // Ensure chat exists
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
    const loadingMsg = await ctx.reply("Fetching your profile information...");
    
    try {
      // Get user profile
      const profile = await profileService.getUserProfile(ctx);
      
      if (profile) {
        // Format and display profile information
        const profileInfo = profileService.formatProfileInfo(profile);
        
        await ctx.api.deleteMessage(ctx.chat.id, loadingMsg.message_id);
        await ctx.reply(profileInfo, {
          parse_mode: "Markdown",
          reply_markup: backToMainKeyboard,
        });
      } else {
        await ctx.api.deleteMessage(ctx.chat.id, loadingMsg.message_id);
        await ctx.reply(
          "Unable to fetch your profile information. Please try again later.",
          { reply_markup: backToMainKeyboard }
        );
      }
    } catch (error) {
      console.error("Error in profile handler:", error);
      await ctx.api.deleteMessage(ctx.chat.id, loadingMsg.message_id);
      await ctx.reply(
        "An error occurred while fetching your profile. Please try again later.",
        { reply_markup: backToMainKeyboard }
      );
    }
};

export default composer;
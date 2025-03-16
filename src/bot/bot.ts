import { Bot } from "grammy";
import { MyContext } from "../utils/sessions";
import { config } from "../config";

// Create bot instance
export const bot = new Bot<MyContext>(config.TELEGRAM_BOT_TOKEN);
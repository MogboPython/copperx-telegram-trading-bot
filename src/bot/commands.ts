import { BotCommand } from "grammy/types";

// Define the bot commands for the menu
export const commands: BotCommand[] = [
  {
    command: "start",
    description: "Start the bot and connect your account",
  },
  {
    command: "help",
    description: "Get help and support",
  },
  {
    command: "chat",
    description: "Join our telegran group for questions and feedback"
  }
];

// Map text commands to their slash command equivalents
export const textCommandsMap: Record<string, string> = {
  "👤 Profile": "/profile",
  "📝 KYC Status": "/kyc",
  "👛 Wallets": "/wallets",
  "💰 Balance": "/balance",
  "💸 Send Money": "/send",
  "🏦 Deposit": "/deposit",
  "📊 Transactions": "/transactions",
  "🔒 Logout": "/logout",
};
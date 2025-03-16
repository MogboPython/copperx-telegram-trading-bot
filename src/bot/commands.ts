import { BotCommand } from "grammy/types";

// Define the bot commands for the menu
export const commands: BotCommand[] = [
  {
    command: "start",
    description: "Start the bot and connect your account",
  },
  {
    command: "profile",
    description: "View your profile information",
  },
  {
    command: "kyc",
    description: "Check your KYC verification status",
  },
  {
    command: "wallets",
    description: "View your connected wallets",
  },
  {
    command: "balance",
    description: "Check your USDC balance",
  },
  {
    command: "send",
    description: "Send USDC to another user",
  },
  {
    command: "deposit",
    description: "Deposit USDC to your account",
  },
  {
    command: "transactions",
    description: "View your transaction history",
  },
  {
    command: "help",
    description: "Get help and support",
  },
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
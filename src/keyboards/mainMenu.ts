import { Markup } from 'telegraf';

export const getMainMenuKeyboard = () => {
  return Markup.inlineKeyboard([
    [Markup.button.callback("👤 Profile", "profile"), Markup.button.callback("📝 KYC Status", "kyc_status")],
    [Markup.button.callback("👛 Wallets", "wallets"), Markup.button.callback("💰 Balance", "balance")],
    [Markup.button.callback("💸 Send Money", "send_money"), Markup.button.callback("🏦 Deposit", "deposit")],
    [Markup.button.callback("📊 Transactions", "transactions")],
    [Markup.button.callback("🔒 Logout", "logout")]
  ]);
};
import { InlineKeyboard, Keyboard } from "grammy";

// Connect account button (displayed when user is not authenticated)
export const connectAccountKeyboard = new InlineKeyboard()
  .text("🔗 Connect Copperx Account", "connect_account");

// Main menu keyboard (displayed after authentication)
export const mainMenuKeyboard = new InlineKeyboard()
  .text("👤 Profile", "menu_profile").text("📝 KYC Status", "menu_kyc").row()
  .text("👛 Wallets", "menu_wallets").text("💰 Balance", "menu_balance").row()
  .text("💸 Send Money", "menu_send").text("🏦 Deposit", "menu_deposit").row()
  .text("📊 Transactions", "menu_transactions").text("🔒 Logout", "menu_logout");

// Back button for sub-menus
export const backToMainKeyboard = new InlineKeyboard()
  .text("« Back to Main Menu", "back_to_main");

// Confirmation keyboard
export const confirmationKeyboard = new InlineKeyboard()
  .text("✅ Confirm", "confirm")
  .text("❌ Cancel", "cancel");

// Create transaction keyboard with dynamic parameters
export function createTransactionKeyboard(transactionId: string): InlineKeyboard {
  return new InlineKeyboard()
    .text("View Details", `view_transaction_${transactionId}`)
    .text("« Back", "back_to_transactions");
}

// Main wallet menu keyboard
export const walletsMenuKeyboard = new InlineKeyboard()
  .text("📋 All Wallets", "wallet_all").text("🔄 Set Default Wallet", "wallet_set_default").row()
  .text("💰 Balances", "menu_balance").row()
  .text("« Back to Main Menu", "back_to_main");

export const txActionsMenuKeyboard = new InlineKeyboard()
  .text("💸 Send Money", "menu_send").text("🏦 Deposit", "menu_deposit").row()
  .text("Refresh", "refresh_balance");

export function createSetDefaultWalletKeyboard(wallets: Array<{ id: string, name: string, address: string }>): InlineKeyboard {
  const keyboard = new InlineKeyboard();
  
  wallets.forEach((wallet) => {
    const displayAddress = wallet.address.length > 16 
    ? `${wallet.address.substring(0, 8)}...${wallet.address.substring(wallet.address.length - 8)}`
    : wallet.address;

    keyboard.text(`${wallet.name} - ${displayAddress}`, `wallet_make_default_${wallet.id}`);
    keyboard.row();
  });
  return keyboard;
}
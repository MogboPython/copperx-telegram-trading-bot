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
  // .text("💰 Balances", "wallet_balances").text("⭐ Default Wallet", "wallet_default").row()
  .text("📋 All Wallets", "wallet_all").text("🔄 Set Default Wallet", "wallet_set_default").row()
  .text("« Back to Main Menu", "back_to_main");

// Keyboard for selecting a default wallet
export function createSetDefaultWalletKeyboard(wallets: Array<{ id: string, name: string, address: string }>): InlineKeyboard {
  const keyboard = new InlineKeyboard();
  
  // Add a button for each wallet
  wallets.forEach((wallet) => {
    // Format wallet address for display (truncate if too long)
    const displayAddress = wallet.address.length > 16 
    ? `${wallet.address.substring(0, 8)}...${wallet.address.substring(wallet.address.length - 8)}`
    : wallet.address;

    keyboard.text(`${wallet.name} - ${displayAddress}`, `wallet_make_default_${wallet.id}`);
    keyboard.row();
  });
  return keyboard;
}

// Keyboard for listing multiple wallets
export function createWalletListKeyboard(wallets: Array<{ id: string, name: string }>): InlineKeyboard {
  const keyboard = new InlineKeyboard();
  
  // Add a button for each wallet
  wallets.forEach((wallet, index) => {
    keyboard.text(`${index + 1}. ${wallet.name}`, `wallet_view_${wallet.id}`);
    
    // Add a row after each wallet (or every 2 wallets if you prefer)
    keyboard.row();
  });
  
  // Add back button
  keyboard.text("« Back to Wallets", "back_to_wallets");
  
  return keyboard;
}
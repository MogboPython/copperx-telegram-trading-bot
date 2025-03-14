import { Markup } from 'telegraf';

export const getAuthKeyboard = () => {
  return Markup.inlineKeyboard([
    [Markup.button.callback("🔗 Connect Account", "connect_account")]
  ]);
};
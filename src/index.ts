import { bot } from "./bot"

// Launch the bot
bot.launch()

// TODO: remove this if not needed
// .then(() => {
//   console.log('Bot is running!');
// }).catch((err) => {
//   console.error('Bot launch failed:', err);
// });

// Enable graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
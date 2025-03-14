import { Telegraf, session } from 'telegraf';
import { TELEGRAM_BOT_TOKEN } from './config';
import { startCommand } from './commands/start';
import { authMiddleware } from './middleware/authMiddleware';
import { callbackHandler } from './handlers/callbackHandler';

// Initialize bot
const bot = new Telegraf(TELEGRAM_BOT_TOKEN);

// Enable session
bot.use(session());

// Register middleware
bot.use(authMiddleware);

// Register commands
bot.command('start', startCommand);
// TODO: remove if not necessary
// Simple ping command to check if bot is running
bot.command('ping', (ctx) => ctx.reply('Pong!'));
bot.command('help', (ctx) => {
  ctx.reply(
    'Available commands:\n' +
    '/start - Open main menu\n' +
    '/help - Show this help message'
  );
});

// Register callback queries with type checks
bot.on('callback_query', callbackHandler);

export { bot };
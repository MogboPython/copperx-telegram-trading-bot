import { Telegraf, Context, session, Scenes } from 'telegraf';
import { TELEGRAM_BOT_TOKEN } from './config';
import { startCommand } from './commands/start';
import { authMiddleware } from './middleware/authMiddleware';
import { callbackHandler } from './handlers/callbackHandler';
import { emailInputScene, otpInputScene } from './utils/inputScenes'
import { MyContext } from './types/context';
 
// Initialize bot
const bot = new Telegraf<MyContext>(TELEGRAM_BOT_TOKEN);

// Enable session
bot.use(session());

// Register the scenes
const stage = new Scenes.Stage<MyContext>([emailInputScene, otpInputScene]);

bot.use(stage.middleware());

// Register middleware
bot.use(authMiddleware);

// Register commands
bot.command('start', startCommand);
// TODO: write better help commands
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
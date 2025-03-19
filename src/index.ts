import express from 'express';
import { setupBot } from "./bot/setup";
import { config } from './config';
import { initSessionStorage, createSessionMiddleware } from "./utils/sessions";

async function main() {
    try {
        const app = express();

        // health check endpoint
        app.get('/health', (req, res) => {
            res.status(200).send({
            status: 'ok',
            timestamp: new Date().toISOString(),
            uptime: process.uptime()
            });
        });

        const port = parseInt(config.PORT, 10);
        app.listen(port, '0.0.0.0', () => {
            console.log(`Server running on port ${port}`);
        });

        // Initialize MongoDB session storage
        console.log("Initializing MongoDB session storage...");
        const adapter = await initSessionStorage();
        
        // Create session middleware with MongoDB adapter
        const sessionMiddleware = createSessionMiddleware(adapter);
        
        // Set up the bot with all modules and middleware
        console.log("Setting up the bot...");
        const bot = await setupBot(sessionMiddleware);
        
        // Start the bot
        console.log("Starting Copperx Payout Telegram bot...");
        await bot.start();
        
        console.log("Bot is running!");
    } catch (error) {
        console.error("Error starting bot:", error);
        process.exit(1);
    }
}

// Run the bot
main().catch(console.error);
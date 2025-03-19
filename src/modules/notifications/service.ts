// src/modules/notifications/service.ts
import Pusher from 'pusher-js';
import axios from 'axios';
import { config } from '../../config';
import { bot } from '../../bot/bot';

export interface DepositNotification {
  amount: string;
  currency: string;
  network: string;
  transactionId: string;
  timestamp: string;
}

// Store active subscriptions to avoid duplicates
const activeSubscriptions = new Map<string, boolean>();

export const notificationService = {
  // Subscribe to organization's deposit notifications
  subscribeToDeposits: async (organizationId: string, accessToken: string, chatId: number): Promise<boolean> => {
    try {
      // Check if already subscribed
      const subscriptionKey = `${organizationId}:${chatId}`;
      if (activeSubscriptions.has(subscriptionKey)) {
        console.log(`Already subscribed to notifications for org ${organizationId} in chat ${chatId}`);
        return true;
      }

      // Initialize Pusher client
      const pusherClient = new Pusher(config.VITE_PUSHER_CLUSTER, {
        cluster: config.PUSHER_CLUSTER,
        authorizer: (channel) => ({
          authorize: async (socketId, callback) => {
            try {
              const response = await axios.post(`${config.COPPERX_API_BASE_URL}/api/notifications/auth`, {
                socket_id: socketId,
                channel_name: channel.name
              }, {
                headers: {
                  Authorization: `Bearer ${accessToken}`
                }
              });
        
              if (response.data) {
                callback(null, response.data);
              } else {
                callback(new Error('Pusher authentication failed'), null);
              }
            } catch (error) {
              console.error('Pusher authorization error:', error);
              callback(error instanceof Error ? error : new Error(String(error)), null);
            }
          }
        })
      });
      
      // Subscribe to organization's private channel
      const channelName = `private-org-${organizationId}`;
      const channel = pusherClient.subscribe(channelName);
      
      // Handle subscription events
      channel.bind('pusher:subscription_succeeded', () => {
        console.log(`Successfully subscribed to channel: ${channelName} for chat: ${chatId}`);
        activeSubscriptions.set(subscriptionKey, true);
      });
      
      channel.bind('pusher:subscription_error', (error: any) => {
        console.error(`Subscription error for channel ${channelName}:`, error);
        activeSubscriptions.delete(subscriptionKey);
      });
      
      // Bind to the deposit event
      channel.bind('deposit', (data: DepositNotification) => {
        // Format the deposit notification message
        const message = notificationService.formatDepositNotification(data);
        
        // Send the notification to the user's chat
        bot.api.sendMessage(chatId, message, {
          parse_mode: "Markdown"
        }).catch(error => {
          console.error(`Error sending deposit notification to chat ${chatId}:`, error);
        });
      });
      
      return true;
    } catch (error) {
      console.error('Error subscribing to deposits:', error);
      return false;
    }
  },
  
  // Format deposit notification message
  formatDepositNotification: (data: DepositNotification): string => {
    return `💰 *New Deposit Received*\n\n` +
           `Amount: ${data.amount} ${data.currency}\n` +
           `Network: ${data.network}\n` +
           `Time: ${new Date(data.timestamp).toLocaleString()}\n\n` +
           `Use /deposit to view deposit details.`;
  }
};

export default notificationService;

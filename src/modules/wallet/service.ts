import { MyContext } from "../../utils/sessions";
import { walletsApi } from "../../utils/api";
import { WalletApiResponse, Wallet, WalletBalance } from '../../types/wallet';
import { saveWallets, getWalletsForUser, getWalletById as getWalletByIdFromDB } from "./models";

// export interface WalletTransaction {
//   id: string;
//   walletId: string;
//   type: string;
//   amount: string;
//   currency: string;
//   status: string;
//   createdAt: string;
//   toAddress?: string;
//   fromAddress?: string;
//   txHash?: string;
// }

function getNetworkNameFromCode(input: string): string | undefined {
    const numberToWordMap: { [key: string]: string } = {
        "137": "Polygon",
        "42161": "Arbitrum",
        "8453": "Base",
        "23434": "Starknet"
    };

    return numberToWordMap[input];
}

export const walletService = {
  // Get all user wallets
  getAllWallets: async (ctx: MyContext): Promise<Wallet[]> => {
    try {
      const accessToken = ctx.session.accessToken;
      const userId = ctx.session.userId;
      
      if (!accessToken || !userId) {
        return [];
      }
      
      // Fetch wallets from API
      const walletsResponse = await walletsApi.getWallets(accessToken);
      const apiWallets: WalletApiResponse[] = walletsResponse || [];
      
      // Save wallets to MongoDB
      if (apiWallets.length > 0) {
        await saveWallets(userId, apiWallets);
      }
      
      // Map API response to our Wallet interface
      const wallets: Wallet[] = apiWallets.map(wallet => ({
        id: wallet.id,
        name: `${getNetworkNameFromCode(wallet.network)}`,
        address: wallet.walletAddress,
        type: wallet.walletType,
        network: wallet.network,
        isDefault: wallet.isDefault,
        createdAt: wallet.createdAt
      }));
      
      return wallets;
    } catch (error) {
      console.error('Error fetching wallets:', error);
      return [];
    }
  },

  // Format wallet details for display
  formatWalletDetails: (wallets: Wallet[]): string => {
    let walletListText = "📋 *Your Wallets*\n(the ⭐ wallet is your default)\n\n";

    wallets.forEach((wallet) => {
        walletListText += `${wallet.name}:  \`${wallet.address}\`${wallet.isDefault ? ' ⭐' : ''}\n`;
    });
    walletListText += "Tap to copy the address and send tokens to deposit.";
    return walletListText;
  },

  // Set default wallet
  setDefaultWallet: async (ctx: MyContext, walletId: string): Promise<boolean> => {
    try {
      const accessToken = ctx.session.accessToken;
      const userId = ctx.session.userId;
      
      if (!accessToken || !userId) {
        return false;
      }
      
      let apiSuccess = false;
      const response = await walletsApi.setDefaultWallet(accessToken, walletId);
      
      if (response && response.id) {
        apiSuccess = true;
        
        // TODO: remove mongo
        // Update the wallet in MongoDB with the response data
        if (userId) {
            await saveWallets(userId, [response]);
          }
        }
        return apiSuccess;

    } catch (error) {
      console.error('Error setting default wallet:', error);
      return false;
    }
  },
  
  // Get wallet balances
  getWalletBalances: async (ctx: MyContext): Promise<WalletBalance[]> => {
    try {
      const accessToken = ctx.session.accessToken;
      
      if (!accessToken) {
        return [];
      }
      
      const balancesResponse = await walletsApi.getBalances(accessToken);
      const apiBalances: WalletBalance[] = balancesResponse || [];

      // Map API response to our WalletBalance interface
      const balances: WalletBalance[] = apiBalances.map(balance => ({
        walletId: balance.walletId,
        isDefault: balance.isDefault,
        network: balance.network,
        balances: balance.balances,
    }));
      
      return balances;
    } catch (error) {
      console.error('Error fetching wallet balances:', error);
      return [];
    }
  },

  formatWalletBalanceDetails: (balances: WalletBalance[]): string => {
    let balanceDetails = "💰 *Your Wallet Balances*\n\n";

    balances.forEach((balance) => {
        for (var i = 0; i < balance.balances.length; i++){
            balanceDetails += `Network: *${getNetworkNameFromCode(balance.network)}*\nAddress: \`${balance.balances[i].address}\`\nBalance: ${balance.balances[i].balance} ${balance.balances[i].symbol}\n\n`;   
        }
    });
    balanceDetails += "Tap to copy the address and send tokens to deposit.";

    return balanceDetails;
  }


  // Get default wallet
//   getDefaultWallet: async (ctx: MyContext): Promise<Wallet | null> => {
//     try {
//       const accessToken = ctx.session.accessToken;
      
//       if (!accessToken) {
//         return null;
//       }
      
//       const wallets = await walletsApi.getWallets(accessToken);
      
//       if (!wallets.data || wallets.data.length === 0) {
//         return null;
//       }
      
//       // Find default wallet
//       const defaultWallet = wallets.data.find(wallet => wallet.isDefault);
      
//       // If no wallet is marked as default, return the first one
//       return defaultWallet || wallets.data[0];
//     } catch (error) {
//       console.error('Error fetching default wallet:', error);
//       return null;
//     }
//   },
  
  // Get wallet by ID
//   getWalletById: async (ctx: MyContext, walletId: string): Promise<Wallet | null> => {
//     try {
//       const accessToken = ctx.session.accessToken;
//       const userId = ctx.session.userId;
      
//       if (!accessToken || !userId) {
//         return null;
//       }
      
//       try {
//         // Try to get from API first
//         const walletResponse = await walletsApi.getWalletById(accessToken, walletId);
        
//         if (walletResponse) {
//           const wallet: Wallet = {
//             id: walletResponse.id,
//             name: `${walletResponse.network}`,
//             address: walletResponse.walletAddress,
//             type: walletResponse.walletType,
//             network: walletResponse.network,
//             isDefault: walletResponse.isDefault,
//             createdAt: walletResponse.createdAt
//           };
          
//           return wallet;
//         }
//       } catch (apiError) {
//         console.error('Error fetching wallet by ID from API:', apiError);
//       }
      
//       // If API call fails, try to get from database
//       const dbWallet = await getWalletByIdFromDB(userId, walletId);
      
//       if (dbWallet) {
//         return {
//           id: dbWallet.walletId,
//           name: `${dbWallet.network}`,
//           address: dbWallet.walletAddress,
//           type: dbWallet.walletType,
//           network: dbWallet.network,
//           isDefault: dbWallet.isDefault,
//           createdAt: dbWallet.createdAt.toISOString()
//         };
//       }
      
//       return null;
//     } catch (error) {
//       console.error('Error fetching wallet by ID:', error);
//       return null;
//     }
//   },
  
  // Get wallet transactions
//   getWalletTransactions: async (ctx: MyContext, walletId: string): Promise<WalletTransaction[]> => {
//     try {
//       const accessToken = ctx.session.accessToken;
      
//       if (!accessToken) {
//         return [];
//       }
      
//       const transactions = await walletsApi.getWalletTransactions(accessToken, walletId);
//       return transactions.data || [];
//     } catch (error) {
//       console.error('Error fetching wallet transactions:', error);
//       return [];
//     }
//   },

  // Format wallet balances for display
//   formatWalletBalances: (balances: WalletBalance[]): string => {
//     let message = "💰 *Your Wallet Balances*\n\n";
    
//     balances.forEach((balance, index) => {
//       message += `*${index + 1}. ${balance.walletName}*\n`;
//       message += `   Balance: ${balance.balance} ${balance.currency}\n`;
//       message += `   Available: ${balance.availableBalance} ${balance.currency}\n\n`;
//     });
    
//     return message.trim();
//   },
  
  // Format wallet transactions for display
//   formatWalletTransactions: (transactions: WalletTransaction[]): string => {
//     let message = "📊 *Recent Transactions*\n\n";
    
//     transactions.slice(0, 5).forEach((tx, index) => {
//       const date = new Date(tx.createdAt).toLocaleDateString();
//       const type = tx.type.charAt(0).toUpperCase() + tx.type.slice(1); // Capitalize first letter
      
//       message += `*${index + 1}. ${type}* - ${tx.amount} ${tx.currency}\n`;
//       message += `   Date: ${date}\n`;
//       message += `   Status: ${tx.status}\n`;
      
//       if (tx.toAddress) {
//         message += `   To: \`${tx.toAddress.substring(0, 10)}...\`\n`;
//       }
      
//       if (tx.txHash) {
//         message += `   TX: \`${tx.txHash.substring(0, 10)}...\`\n`;
//       }
      
//       message += "\n";
//     });
    
//     if (transactions.length > 5) {
//       message += `_Showing 5 of ${transactions.length} transactions_`;
//     }
    
//     return message.trim();
//   }
};

export default walletService;
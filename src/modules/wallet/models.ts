import { MongoClient, Collection } from 'mongodb';
import { config } from '../../config';
import { WalletDocument, WalletApiResponse } from '../../types/wallet';

// Collection reference
let walletsCollection: Collection<WalletDocument>;

// Initialize the wallets collection
export const initWalletsCollection = async (client: MongoClient): Promise<void> => {
  try {
    const db = client.db(config.MONGODB_DB_NAME);
    walletsCollection = db.collection<WalletDocument>('wallets');
    
    // Create indexes for efficient queries
    await walletsCollection.createIndex({ userId: 1 });
    await walletsCollection.createIndex({ walletId: 1 });
    await walletsCollection.createIndex({ userId: 1, walletId: 1 }, { unique: true });
    
    console.log('Wallets collection initialized');
  } catch (error) {
    console.error('Error initializing wallets collection:', error);
    throw error;
  }
};

export const saveWallets = async (userId: string, wallets: WalletApiResponse[]): Promise<void> => {
  try {
    if (!walletsCollection) {
      throw new Error('Wallets collection not initialized');
    }
    
    // Process each wallet
    const operations = wallets.map(wallet => {
      const walletDoc: WalletDocument = {
        walletId: wallet.id,
        userId,
        walletType: wallet.walletType,
        network: wallet.network,
        walletAddress: wallet.walletAddress,
        isDefault: wallet.isDefault,
        createdAt: new Date(wallet.createdAt)
      };
      
      // Upsert operation (update if exists, insert if doesn't)
      return {
        updateOne: {
          filter: { userId, walletId: wallet.id },
          update: { $set: walletDoc },
          upsert: true
        }
      };
    });
    
    if (operations.length > 0) {
      await walletsCollection.bulkWrite(operations);
    }
  } catch (error) {
    console.error('Error saving wallets:', error);
    throw error;
  }
};

// Get wallets for a user from the database
export const getWalletsForUser = async (userId: string): Promise<WalletDocument[]> => {
  try {
    if (!walletsCollection) {
      throw new Error('Wallets collection not initialized');
    }
    
    return await walletsCollection.find({ userId }).toArray();
  } catch (error) {
    console.error('Error getting wallets for user:', error);
    throw error;
  }
};

// Get a specific wallet by ID for a user
export const getWalletById = async (userId: string, walletId: string): Promise<WalletDocument | null> => {
  try {
    if (!walletsCollection) {
      throw new Error('Wallets collection not initialized');
    }
    
    return await walletsCollection.findOne({ userId, walletId });
  } catch (error) {
    console.error('Error getting wallet by ID:', error);
    throw error;
  }
};

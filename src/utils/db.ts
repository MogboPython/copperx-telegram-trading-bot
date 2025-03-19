import { MongoClient } from 'mongodb';
import { config } from '../config';

// Create MongoDB client
const client = new MongoClient(config.MONGODB_URI);

// Connect to MongoDB
export async function connectToDatabase() {
  try {
    await client.connect();
    console.log('Connected to MongoDB');

    return client.db(config.MONGODB_DB_NAME);
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
    throw error;
  }
}

// Close MongoDB connection on app shutdown
process.on('SIGINT', async () => {
  await client.close();
  console.log('MongoDB connection closed');
  process.exit(0);
});

export default client;
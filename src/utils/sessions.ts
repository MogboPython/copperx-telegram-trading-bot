import { Context, SessionFlavor, session } from "grammy";
import { MongoDBAdapter, ISession } from "@grammyjs/storage-mongodb";
import { SessionData } from "~/types/user";
import { config } from "../config";
import { connectToDatabase } from "./db";


// Initial session data
export const initialSessionData: SessionData = {
  isAuthenticated: false,
};

// Create session middleware
export type MyContext =  Context & SessionFlavor<SessionData>;

// Create MongoDB session storage adapter
let mongoAdapter: MongoDBAdapter<SessionData>;

// Initialize MongoDB session storage
export async function initSessionStorage() {
    const db = await connectToDatabase();
    const collection = db.collection<ISession>(config.MONGODB_COLLECTION);
    mongoAdapter = new MongoDBAdapter({ collection });
    return mongoAdapter;
  }

export function createSessionMiddleware(adapter: MongoDBAdapter<SessionData>) {
    return session({
      initial: () => initialSessionData,
      getSessionKey: (ctx) => {
        // Return a unique identifier for this user
        const userId = ctx.from?.id.toString();
        if (!userId) return undefined;
        return `${config.SESSION_KEY}:${userId}`;
      },
      storage: adapter,
    });
  }

// Helper function to check authentication
export function isAuthenticated(ctx: MyContext): boolean {
  return !!ctx.session.isAuthenticated && 
         !!ctx.session.accessToken && 
         isTokenValid(ctx.session.expireAt);
}

// Helper function to check if token is expired
function isTokenValid(expireAt?: string): boolean {
  if (!expireAt) return false;
  
  const expireDate = new Date(expireAt);
  const now = new Date();
  
  return expireDate > now;
}

// Helper function to set authentication
export function setAuthenticated(ctx: MyContext, authData: { 
  accessToken: string;
  accessTokenId: string;
  expireAt: string;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    profileImage?: string;
    organizationId: string;
    role: string;
    status: string;
    walletAddress?: string;
    walletId?: string;
    [key: string]: any;
  };
}): void {
  ctx.session.isAuthenticated = true;
  ctx.session.accessToken = authData.accessToken;
  ctx.session.accessTokenId = authData.accessTokenId;
  ctx.session.expireAt = authData.expireAt;
  
  // Store user data
  const { user } = authData;
  ctx.session.userId = user.id;
  ctx.session.firstName = user.firstName;
  ctx.session.lastName = user.lastName;
  ctx.session.email = user.email;
  ctx.session.profileImage = user.profileImage;
  ctx.session.organizationId = user.organizationId;
  ctx.session.role = user.role;
  ctx.session.status = user.status;
  ctx.session.walletAddress = user.walletAddress;
  ctx.session.walletId = user.walletId;
}

// Helper function to clear authentication
export function clearAuthentication(ctx: MyContext): void {
  ctx.session = { ...initialSessionData };
}
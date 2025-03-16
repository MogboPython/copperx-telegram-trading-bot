export interface UserData {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  profileImage?: string;
  organizationId: string;
  role: string;
  status: string;
  type: string;
  relayerAddress?: string;
  flags: string[];
  walletAddress?: string;
  walletId?: string;
  walletAccountType?: string;
}

// Define the session structure
export interface SessionData {
  isAuthenticated: boolean;
  // TODO: ad if eventually necessary
  // isVerified: boolean;
  accessToken?: string;
  accessTokenId?: string;
  expireAt?: string;
  userId?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  profileImage?: string;
  organizationId?: string;
  role?: string;
  status?: string;
  walletAddress?: string;
  walletId?: string;
  currentAction?: string;
  tempData?: Record<string, any>;
}

export interface UserSession {
  telegramId: number;
  userId: string;
  accessToken: string;
  accessTokenId: string;
  expireAt: string;
  profile: UserData;
  otpSid?: string;
  email?: string;
}
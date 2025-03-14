export interface UserProfile {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  profileImage: string;
  organizationId: string;
  role: 'owner' | 'member';
  status: 'pending' | 'active';
  type: 'individual' | 'business';
  relayerAddress: string;
  flags: string[];
  walletAddress: string;
  walletId: string;
  walletAccountType: string;
}

export interface UserSession {
  telegramId: number;
  userId: string;
  accessToken: string;
  accessTokenId: string;
  expireAt: string;
  profile: UserProfile;
  otpSid?: string;
  email?: string;
}
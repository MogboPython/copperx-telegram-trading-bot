import { COPPERX_API_BASE_URL, COPPERX_API_KEY } from '../config';
import axios from 'axios';

interface UserData {
  userId: string;
  email?: string;
  name?: string;
  apiToken?: string;
}

// In-memory storage for user sessions (replace with DB in production)
const userSessions = new Map<number, UserData>();

export const authService = {
  /**
   * Check if a user is authenticated
   */
  isAuthenticated: (telegramId: number): boolean => {
    return userSessions.has(telegramId);
  },

  /**
   * Save user session
   */
  saveUserSession: (telegramId: number, userData: UserData): void => {
    userSessions.set(telegramId, userData);
  },

  /**
   * Get user data by telegram ID
   */
  getUserData: (telegramId: number): UserData | undefined => {
    return userSessions.get(telegramId);
  },

  /**
   * Remove user session (logout)
   */
  removeUserSession: (telegramId: number): boolean => {
    return userSessions.delete(telegramId);
  },

  /**
   * Verify token with Copperx API
   * This is a placeholder - implement actual API verification
   */
  verifyToken: async (token: string): Promise<UserData | null> => {
    try {
      // This is a placeholder - replace with actual API endpoint
      const response = await axios.post(
        `${COPPERX_API_BASE_URL}/auth/verify-token`,
        { token },
        {
          headers: {
            'Authorization': `Bearer ${COPPERX_API_KEY}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      if (response.data?.valid) {
        return {
          userId: response.data.userId,
          email: response.data.email,
          name: response.data.name,
          apiToken: token
        };
      }
      return null;
    } catch (error) {
      console.error('Error verifying token:', error);
      return null;
    }
  },

  /**
   * Generate auth link for the user
   * This is a placeholder - implement your authentication flow
   */
  generateAuthLink: (telegramId: number): string => {
    // In a real implementation, you might generate a unique link with a token
    // that users can use to authenticate on your web platform
    return `https://app.copperx.com/connect/telegram?id=${telegramId}`;
  }
};
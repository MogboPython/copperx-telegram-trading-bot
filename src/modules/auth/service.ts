import { authApi } from '../../utils/api';
import { MyContext, setAuthenticated, clearAuthentication } from '../../utils/sessions';
import { EmailOtpRequestResponse } from '../../types/auth';

export const authService = {
  // Request OTP for email authentication
  requestEmailOtp: async (email: string): Promise<EmailOtpRequestResponse | null> => {
    try {
      const result = await authApi.requestEmailOtp(email);
      return result;
    } catch (error) {
      console.error('Error requesting OTP:', error);
      return null;
    }
  },
  
  // Verify OTP and authenticate user
  authenticateWithOtp: async (
    ctx: MyContext, 
    email: string, 
    otp: string, 
    sid: string
  ): Promise<boolean> => {
    try {
      const authResponse = await authApi.authenticateWithOtp(email, otp, sid);
      
      if (authResponse && authResponse.accessToken) {
        // Set the session as authenticated with all user data
        setAuthenticated(ctx, authResponse);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Authentication error:', error);
      return false;
    }
  },
  
  // Get current user profile
  getUserProfile: async (ctx: MyContext) => {
    try {
      const token = ctx.session.accessToken;
      
      if (!token) {
        return null;
      }
      
      return await authApi.getUserProfile(token);
    } catch (error) {
      console.error('Error fetching user profile:', error);
      return null;
    }
  },

  // Logout the user
  logout: (ctx: MyContext): void => {
    clearAuthentication(ctx);
  },
};

export default authService;
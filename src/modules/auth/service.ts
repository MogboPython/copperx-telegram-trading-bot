import { authApi } from '../../utils/api';
import { MyContext, setAuthenticated, clearAuthentication } from '../../utils/sessions';
import { EmailOtpRequestResponse } from '../../types/auth';
import { recordAuthAttempt } from '../../utils/rate-limiter';
import { notificationService } from '../../modules/notifications/service'

export const authService = {
  // Request OTP for email authentication
  requestEmailOtp: async (ctx: MyContext, email: string): Promise<EmailOtpRequestResponse | null> => {
    try {
      const result = await authApi.requestEmailOtp(email);
      
      if (result && result.sid) {
        // Record successful attempt if we get a sid
        if (ctx.from) {
          recordAuthAttempt(ctx.from.id, true);
        }
      } else {
        // Record failed attempt
        if (ctx.from) {
          recordAuthAttempt(ctx.from.id, false);
        }
      }
      
      return result;
    } catch (error) {
      console.error('Error requesting OTP:', error);
      
      // Record failed attempt
      if (ctx.from) {
        recordAuthAttempt(ctx.from.id, false);
      }
      
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
        // Set the session as authenticated with users data
        setAuthenticated(ctx, authResponse);
        
        // Record successful authentication
        if (ctx.from) {
          recordAuthAttempt(ctx.from.id, true);
        }
        
        return true;
      }
      
      // Record failed authentication
      if (ctx.from) {
        recordAuthAttempt(ctx.from.id, false);
      }
      
      return false;
    } catch (error) {
      console.error('Authentication error:', error);
      
      // Record failed authentication
      if (ctx.from) {
        recordAuthAttempt(ctx.from.id, false);
      }
      
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

  initializeNotifications: async (ctx: MyContext): Promise<void> => {
    try {
      if (!ctx.from || !ctx.chat) {
        return;
      }
      
      const organizationId = ctx.session.organizationId;
      const accessToken = ctx.session.accessToken;
      
      if (!organizationId || !accessToken) {
        return;
      }
      
      // Subscribe to deposit notifications
      await notificationService.subscribeToDeposits(
        organizationId,
        accessToken,
        ctx.chat.id
      );
    } catch (error) {
      console.error('Error initializing notifications:', error);
    }
  },

  // Logout the user
  logout: (ctx: MyContext): void => {
    clearAuthentication(ctx);
  },
};

export default authService;
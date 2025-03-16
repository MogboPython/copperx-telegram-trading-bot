import { authApi } from '../../utils/api';
import { MyContext } from '../../utils/sessions';
import { UserData } from '../../types/user';

export const profileService = {
  // Get user profile information
  getUserProfile: async (ctx: MyContext): Promise<UserData | null> => {
    try {
      const accessToken = ctx.session.accessToken;
      
      if (!accessToken) {
        return null;
      }
      
      const profileData = await authApi.getUserProfile(accessToken);
      return profileData;
    } catch (error) {
      console.error('Error fetching user profile:', error);
      return null;
    }
  },
  
  // Format profile data for display
  formatProfileInfo: (profile: UserData): string => {
    return `
👤 *User Profile*

*Name:* ${profile.firstName} ${profile.lastName}
*Email:* ${profile.email}
*Status:* ${profile.status}
*Role:* ${profile.role}
*Account Type:* ${profile.type}
${profile.walletAddress ? `*Wallet Address:* \`${profile.walletAddress}\`` : ''}
    `.trim();
  }
};

export default profileService;
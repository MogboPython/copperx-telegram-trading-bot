import { kycApi } from '../../utils/api';
import { MyContext } from '../../utils/sessions';
import { KycStatusResponse } from '../../types/kyc';

export const kycService = {
    getKYCStatus: async (ctx: MyContext): Promise<KycStatusResponse | null> => {
        try {
            const accessToken = ctx.session.accessToken || '';

            const kycData = await kycApi.getKYCStatus(accessToken);
            return kycData as KycStatusResponse;
        } catch (error) {
            console.error('KYC Service - Error retrieving KYC status:', error);
            return null;
        }
    },

     // Checks if a user is KYC verified
    isUserVerified: (kycResponse: KycStatusResponse | null): boolean => {
        if (!kycResponse) {
            return false;
        }
        return kycResponse.count > 0 && kycResponse.data.length > 0;
    },

    formatKycInfo: (kycData: KycStatusResponse): string => {
        // TODO: for kycData.count
        return `
🔐 *KYC Verification*

*Status:* ${kycData.data[0].status}
*Type:* ${kycData.data[0].type || 'Not specified'}
*Country:* ${kycData.data[0].country || 'Not specified'}
*Verfied At:* ${new Date(kycData.data[0].createdAt).toLocaleDateString()}
        `.trim();
      },
};
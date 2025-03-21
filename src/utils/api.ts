import axios from 'axios';
import { config } from '../config';
import { AuthResponse, EmailOtpRequestResponse } from '../types/auth';
import { UserData } from '../types/user';
import { KycStatusResponse } from '../types/kyc';
import { Transaction, TransactionResponse } from '../types/transaction';
import { Wallet } from '../types/wallet';

// Create an axios instance for the Copperx API
const api = axios.create({
  baseURL: config.COPPERX_API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Authentication API methods
export const authApi = {
  requestEmailOtp: async (email: string) => {
    try {
      const response = await api.post('/api/auth/email-otp/request', { email });
      return response.data as EmailOtpRequestResponse;
    } catch (error) {
      console.error('Error requesting email OTP:', error);
      throw error;
    }
  },
  
  authenticateWithOtp: async (email: string, otp: string, sid: string) => {
    try {
      const response = await api.post('/api/auth/email-otp/authenticate', { 
        email, 
        otp, 
        sid 
      });
      return response.data as AuthResponse;
    } catch (error) {
      console.error('Error authenticating with OTP:', error);
      throw error;
    }
  },
  
  getUserProfile: async (token: string) => {
    try {
      const response = await api.get('/api/auth/me', {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data as UserData;
    } catch (error) {
      console.error('Error fetching user profile:', error);
      throw error;
    }
  },
};

// KYC status API methods
export const kycApi = {
  getKYCStatus: async (token: string) => {
    try {
      const response = await api.get('/api/kycs', {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data as KycStatusResponse;
    } catch (error) {
      console.error('Error fetching KYC status:', error);
      throw error;
    }
  },
};

// Wallets API methods
export const walletsApi = {
  getWallets: async (token: string) => {
    try {
      const response = await api.get('/api/wallets', {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching wallets:', error);
      throw error;
    }
  },

  getDefaultWallet: async (token: string) => {
    try {
      const response = await api.get('/api/wallets/default', {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data as Wallet;
    } catch (error) {
      console.error('Error fetching wallet by ID:', error);
      throw error;
    }
  },
  
  getBalances: async (token: string) => {
    try {
      const response = await api.get('/api/wallets/balances', {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching wallet balances:', error);
      throw error;
    }
  },
  
  setDefaultWallet: async (token: string, walletId: string) => {
    try {
      const response = await api.post('/api/wallets/default', {walletId}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data as Wallet;
    } catch (error) {
      console.error('Error setting default wallet:', error);
      throw error;
    }
  },
};

export const transferApi = {
  getTransactions: async (token: string, page = 1, limit = 10) => {
    try {
      const response = await api.get('/api/transfers', {
        headers: { Authorization: `Bearer ${token}` },
        params: { page, limit }
      });
      return response.data as TransactionResponse;
    } catch (error) {
      console.error('Error fetching wallet transactions:', error);
      throw error;
    }
  },
  
  getTransactionById: async (token: string, transactionId: string) => {
    try {
      const response = await api.get(`/api/transfers/${transactionId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data as Transaction;
    } catch (error) {
      console.error('Error fetching transaction details:', error);
      throw error;
    }
  },

  sendMoney: async (token: string, data: { recipient: string; amount: number }) => {
    try {
      const response = await api.post('api/transfer/', data, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      console.error('Error sending money:', error);
      throw error;
    }
  },
};

export default api;
// src/services/copperxApi.ts
import axios, { AxiosInstance } from 'axios';
import { COPPERX_API_BASE_URL } from '../config';
import { KycStatusResponse } from '../types/kyc'

// Types
export interface EmailOtpRequestPayload {
  email: string;
}

export interface EmailOtpRequestResponse {
  email: string;
  sid: string;
}

export interface EmailOtpAuthenticatePayload {
  email: string;
  otp: string;
  sid: string;
}

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

export interface AuthResponse {
  scheme: string;
  accessToken: string;
  accessTokenId: string;
  expireAt: string;
  user: UserProfile;
}

// API Service
export class CopperxApiService {
  private api: AxiosInstance;
  private authToken: string | null = null;
  
  constructor() {
    this.api = axios.create({
      baseURL: COPPERX_API_BASE_URL,
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    // Add response interceptor for handling errors
    this.api.interceptors.response.use(
      response => response,
      error => {
        console.error('API Error:', error.response?.data || error.message);
        return Promise.reject(error);
      }
    );
  }
  
  // Set auth token
  setAuthToken(token: string) {
    this.authToken = token;
    this.api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  }
  
  // Clear auth token
  clearAuthToken() {
    this.authToken = null;
    delete this.api.defaults.headers.common['Authorization'];
  }
  
  // Request email OTP
  async requestEmailOtp(payload: EmailOtpRequestPayload): Promise<EmailOtpRequestResponse> {
    const response = await this.api.post('/api/auth/email-otp/request', payload);
    return response.data;
  }
  
  // Authenticate with email OTP
  async authenticateWithEmailOtp(payload: EmailOtpAuthenticatePayload): Promise<AuthResponse> {
    const response = await this.api.post('/api/auth/email-otp/authenticate', payload);
    if (response.data.accessToken) {
      this.setAuthToken(response.data.accessToken);
    }
    return response.data;
  }
  
  // Get user profile
  async getUserProfile(): Promise<UserProfile> {
    if (!this.authToken) {
      throw new Error('Not authenticated');
    }
    
    const response = await this.api.get('/api/auth/me');
    return response.data;
  }
  
  // Get KYC status
  async getKycStatus(): Promise<KycStatusResponse> {
    if (!this.authToken) {
      throw new Error('Not authenticated');
    }
    
    const response = await this.api.get('/api/kycs');
    return response.data;
  }
}

// Export singleton instance
export const copperxApi = new CopperxApiService();
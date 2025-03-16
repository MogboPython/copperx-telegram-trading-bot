import { UserData } from "./user";

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

export interface AuthResponse {
    scheme: string;
    accessToken: string;
    accessTokenId: string;
    expireAt: string;
    user: UserData;
}
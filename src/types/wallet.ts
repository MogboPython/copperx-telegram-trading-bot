import { IntegerType } from "mongodb";

export interface WalletDocument {
    walletId: string;
    userId: string;
    walletType: string;         
    network: string;        
    walletAddress: string;      
    isDefault: boolean;         
    createdAt: Date;
}

export interface WalletApiResponse {
    id: string;
    createdAt: string;
    updatedAt: string;
    organizationId: string;
    walletType: string;
    network: string;
    walletAddress: string;
    isDefault: boolean;
}

export interface Wallet {
    id: string;
    name: string;
    walletAddress: string;
    type: string;
    network: string;
    isDefault?: boolean;
    balance?: string;
    currency?: string;
    createdAt: string;
}

export interface WalletBalance{
    walletId: string,
    isDefault: boolean,
    network: string,
    balances: Balance[]
}

export interface Balance {
    decimals: number,
    balance: string,
    symbol: string,
    address: string
}

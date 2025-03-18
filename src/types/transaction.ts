export interface TransactionResponse {
    page: number;
    limit: number;
    count: number;
    hasMore: boolean;
    data: Transaction[];
}

export interface Transaction {
    id: string;
    createdAt: string;
    updatedAt: string;
    organizationId: string;
    status: string;
    customerId: string;
    customer?: {
      id: string;
      name: string;
      businessName: string;
      email: string;
      country: string;
    };
    type: string;
    sourceCountry: string;
    destinationCountry: string;
    destinationCurrency: string;
    amount: string;
    currency: string;
    amountSubtotal: string;
    totalFee: string;
    feeCurrency: string;
    destinationAccount?: {
      id: string;
      type: string;
      walletAddress?: string;
      payeeEmail?: string;
      payeeDisplayName?: string;
    };
    sourceAccount?: {
      id: string;
      type: string;
      walletAddress?: string;
    };
    senderDisplayName?: string;
    transactions?: Array<{
      id: string;
      status: string;
      transactionHash?: string;
    }>;
  }
  
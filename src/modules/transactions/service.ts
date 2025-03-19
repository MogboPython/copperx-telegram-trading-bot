// src/modules/transactions/service.ts
import { MyContext } from "../../utils/sessions";
import { transferApi } from "../../utils/api";
import { Transaction, TransactionResponse } from "../../types/transaction";

function getRecipient(transaction: Transaction): string | undefined {
    let recipient = 'Unknown Recipient';
    
    if (transaction.destinationAccount?.payeeDisplayName) {
      recipient = transaction.destinationAccount.payeeDisplayName;
    } else if (transaction.destinationAccount?.payeeEmail) {
      recipient = transaction.destinationAccount.payeeEmail;
    } else if (transaction.destinationAccount?.walletAddress) {
      // Truncate wallet address if present
      const address = transaction.destinationAccount.walletAddress;
      recipient = `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
    }

    return recipient
};

// Formats an amount in 10^8 format to a human-readable decimal
function formatAmount(amount: string | number, decimals = 8): string {
    try {
      const numericAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
      const actualAmount = numericAmount / Math.pow(10, decimals);
      
      return actualAmount.toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: decimals
      });
    } catch (error) {
      console.error('Error formatting amount:', error);
      return amount.toString();
    }
  };

export const transactionService = {
  // Get user transactions
  getTransactions: async (ctx: MyContext, page = 1, limit = 10): Promise<TransactionResponse | null> => {
    try {
      const accessToken = ctx.session.accessToken;
      
      if (!accessToken) {
        return null;
      }
      
      return await transferApi.getTransactions(accessToken, page, limit);
    } catch (error) {
      console.error('Error fetching transactions:', error);
      return null;
    }
  },
  
  // Get transaction by ID
  getTransactionById: async (ctx: MyContext, transactionId: string): Promise<Transaction | null> => {
    try {
      const accessToken = ctx.session.accessToken;
      
      if (!accessToken) {
        return null;
      }
      
      return await transferApi.getTransactionById(accessToken, transactionId);
    } catch (error) {
      console.error('Error fetching transaction by ID:', error);
      return null;
    }
  },
  
  // Format transaction list items
  formatTransactionList: (transaction: Transaction, index: number): string => {
    let recipient = getRecipient(transaction);

    const date = new Date(transaction.createdAt).toLocaleDateString();
    const amount = `${formatAmount(transaction.amount, 8)} ${transaction.currency}`;
    const type = transaction.type.charAt(0).toUpperCase() + transaction.type.slice(1);
    
    // TODO: change this
    return `/${index + 1} *Recipient:* ${recipient}\n*Type:* ${type}\n*Amount:* ${amount}\n*Date:* ${date}\n`;
  },
  
  // Format detailed transaction view
  formatTransactionDetail: (transaction: Transaction): string => {
    let recipient = getRecipient(transaction);
    
    return `*Transaction ID:* \`${transaction.id}\`
*Date:* ${new Date(transaction.createdAt).toLocaleDateString()}
*Type:* ${transaction.type.charAt(0).toUpperCase() + transaction.type.slice(1)}
*Amount:* ${formatAmount(transaction.amount, 8)} ${transaction.currency}
*Status:* ${transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}
*Recipient:* ${recipient}
*Fee:* ${formatAmount(transaction.totalFee, 8)} ${transaction.feeCurrency}`;
  }
};

export default transactionService;
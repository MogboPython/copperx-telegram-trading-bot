# CopperX Telegram Bot

A Telegram bot for managing CopperX accounts, wallets, and transactions directly from Telegram. The bot provides a seamless interface for users to connect their CopperX accounts, view wallet information, check transaction history, and receive real-time deposit notifications.

**Live Bot**: [t.me/mo_copperx_tele_v1_bot](https://t.me/mo_copperx_tele_v1_bot)
**Server Deployment**: coming soon

## Features

- **Authentication**: Connect to your CopperX account using email OTP
- **Profile Management**: View profile information and KYC status
- **Wallet Management**: View wallets, check balances, set default wallets
- **Transaction History**: Review transaction history with detailed views
- **Real-time Notifications**: Receive push notifications for new deposits
- **Security**: Rate limiting, brute force protection, and secure session handling

## Technology Stack

- **Framework**: GrammY (Telegram Bot Framework for TypeScript)
- **Backend**: Node.js, TypeScript
- **Database**: MongoDB for session storage and wallet caching
- **Real-time Updates**: Pusher for deposit notifications
- **API Integration**: CopperX API for account management, wallets, and transactions

## Getting Started

### Prerequisites

- Node.js (v16+)
- MongoDB instance
- Telegram Bot Token (from [@BotFather](https://t.me/BotFather))
- CopperX API credentials

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/copperx-telegram-bot.git
   cd copperx-telegram-bot
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Rename `example.env` to `.env` in the project root and fill with your secret keys.

4. Build the project:
   ```bash
   npm run build
   ```

5. Start the bot:
   ```bash
   npm start
   ```

## Project Structure

```
src/
├── bot/                # Bot configuration and setup
│   ├── bot.ts          # Bot instance creation
│   ├── commands.ts     # Command definitions
│   ├── keyboards.ts    # Inline keyboard definitions
│   └── setup.ts        # Bot initialization and middleware
├── config.ts           # Configuration variables
├── index.ts            # Entry point
├── modules/            # Feature modules
│   ├── auth/           # Authentication features
│   ├── kyc/            # KYC verification features
│   ├── notifications/  # Deposits notifications using Pusher
│   ├── profile/        # User profile features
│   ├── transfers/      # Send funds features
│   ├── transactions/   # Transaction history features
│   └── wallets/        # Wallet management features
├── types/              # TypeScript type definitions
│   ├── auth.ts         # Authentication types
│   ├── kyc.ts          # KYC types
│   ├── transaction.ts  # Transaction types
│   └── user.ts         # User and session types
└── utils/              # Utility functions
    ├── api.ts          # API integration helpers
    ├── db.ts           # Database connection
    ├── message.ts      # Message formatting
    ├── rate-limiter.ts # Rate limiting middleware
    └── sessions.ts     # Session management
```

## API Integration

The bot integrates with the CopperX API for all functionality. Here are the key integration points:

### Authentication

- **Email OTP Request**: `POST /api/auth/email-otp/request`
- **OTP Verification**: `POST /api/auth/email-otp/authenticate`
- **User Profile**: `GET /api/auth/me`

### Wallet Management

- **Get Wallets**: `GET /api/wallets`
- **Set Default Wallet**: `POST /api/wallets/default`
- **Get Default Wallet**: `GET /api/wallets/default`
- **Get Wallet Balances**: `GET /api/wallets/balances`
- **Get Transaction history**: `/api/transfers?page=1&limit=10`

### KYC Verification

- **Get KYC Status**: `GET /api/kycs`

### TransaFund Transfersctions

- **Email transfer**: `/api/transfers/send`
- **Wallet transfer**: `/api/transfers/wallet-withdraw`
- **Bank withdrawal**: `/api/transfers/offramp`
- **Bulk transfers**: `/api/transfers/send-batch`

### Notifications

- **Pusher Authentication**: `POST /api/notifications/auth`

## Command Reference

| Command | Description |
|---------|-------------|
| `/start` | Start the bot and connect your account |
| `/profile` | View your profile information |
| `/kyc` | Check your KYC verification status |
| `/wallets` | Access your wallet management menu |
| `/balance` | Check your account balance |
| `/transactions` | View your transaction history |
| `/deposit` | View deposit information |
| `/notifications` | Set up deposit notifications |
| `/help` | Get help and support |
| `/logout` | Disconnect your account |

## Security Features

### Rate Limiting

The bot implements rate limiting to prevent abuse:
- Maximum of 5 authentication attempts within a 15-minute window
- 30-minute cooldown after too many failed attempts
- Proper user feedback about remaining attempts

### Session Management

- Secure session storage in MongoDB
- Session expiration based on JWT token expiry
- Session clearing on logout

### Error Handling

- Comprehensive error logging
- User-friendly error messages
- Graceful degradation when API is unavailable


## Future improvements

[ ] In bot KYC/KYB verification
[ ] Add two-factor authentication for high-value transactions
[ ] Allow users to schedule recurring or future-dated transactions

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request


## Acknowledgements

- [GrammY](https://grammy.dev/) - Telegram Bot Framework for TypeScript
- [MongoDB](https://www.mongodb.com/) - Database for session storage
- [Pusher](https://pusher.com/) - Real-time notifications
- [CopperX](https://copperx.io/) - API provider

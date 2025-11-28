# DCCP Backend Server

Backend server for the Decentralized Carbon Credit Platform (DCCP).

## Features

- **Dual Authentication**: Email/password and Web3 wallet authentication (SIWE/EIP-4361)
- **Role-Based Access Control**: Company, Auditor, and Registry roles
- **Entity Management**: CRUD operations for companies, auditors, and registries
- **Smart Contract Integration**: Ethereum blockchain interaction via ethers.js
- **Security**: Helmet, CORS, rate limiting, JWT tokens
- **Database**: PostgreSQL with Prisma ORM

## Technology Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Web3**: ethers.js v6
- **Authentication**: JWT + SIWE

## Setup Instructions

### 1. Prerequisites

- Node.js 18+ and npm
- PostgreSQL database running locally or remotely

### 2. Install Dependencies

```bash
cd server
npm install
```

### 3. Configure Environment

Copy the example environment file and update with your values:

```bash
cp .env.example .env
```

**Important environment variables to update:**
- `DATABASE_URL`: Your PostgreSQL connection string
- `JWT_SECRET`: A secure random string for JWT signing
- `ETHEREUM_RPC_URL`: Your Ethereum RPC endpoint (e.g., Alchemy, Infura)
- `CONTRACT_ADDRESS`: Your deployed carbon credit smart contract address

### 4. Initialize Database

Run Prisma migrations to create the database schema:

```bash
npm run prisma:generate
npm run prisma:migrate
```

This creates the following tables:
- `User` - User accounts with email/wallet authentication
- `Company` - Company profiles
- `Auditor` - Auditor profiles
- `Registry` - Registry profiles
- `Session` - Refresh token sessions

### 5. Start Development Server

```bash
npm run dev
```

The server will start on `http://localhost:3001` (or the PORT specified in `.env`).

## API Endpoints

### Authentication

- `POST /api/auth/register` - Register with email/password
- `POST /api/auth/login` - Login with email/password
- `GET /api/auth/nonce/:address` - Get nonce for Web3 authentication
- `POST /api/auth/verify-signature` - Verify SIWE signature
- `POST /api/auth/refresh` - Refresh access token
- `POST /api/auth/logout` - Logout and invalidate refresh token
- `GET /api/auth/me` - Get current user info (protected)

### Companies

- `GET /api/companies` - List all companies (public)
- `GET /api/companies/:id` - Get company by ID
- `GET /api/companies/me/profile` - Get authenticated user's company (protected)
- `POST /api/companies` - Create company profile (COMPANY role)
- `PUT /api/companies/:id` - Update company
- `DELETE /api/companies/:id` - Delete company (owner only)
- `PUT /api/companies/:id/verify` - Verify company (AUDITOR/REGISTRY only)
- `POST /api/companies/:id/link-wallet` - Link wallet to company

### Smart Contracts

- `GET /api/contracts/balance/:address` - Get credit balance for address
- `GET /api/contracts/project/:id` - Get project details from blockchain
- `POST /api/contracts/verify-transaction` - Verify transaction hash
- `GET /api/contracts/events` - Get recent blockchain events

### Health Check

- `GET /api/health` - Server health status

## Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build TypeScript to JavaScript
- `npm start` - Start production server
- `npm test` - Run tests
- `npm run prisma:generate` - Generate Prisma client
- `npm run prisma:migrate` - Run database migrations
- `npm run prisma:studio` - Open Prisma Studio (database GUI)

## Database Management

### View Database

Use Prisma Studio to view and edit database records:

```bash
npm run prisma:studio
```

This opens a web interface at `http://localhost:5555`.

### Create Migration

After modifying `prisma/schema.prisma`:

```bash
npx prisma migrate dev --name migration_name
```

### Reset Database

**Warning: This deletes all data!**

```bash
npx prisma migrate reset
```

## Testing

Run the test suite:

```bash
npm test
```

Run tests in watch mode:

```bash
npm run test:watch
```

Generate coverage report:

```bash
npm run test:coverage
```

## Project Structure

```
server/
├── src/
│   ├── controllers/      # Route controllers
│   │   ├── auth.controller.ts
│   │   ├── company.controller.ts
│   │   └── contract.controller.ts
│   ├── middleware/       # Express middleware
│   │   ├── auth.ts
│   │   └── errorHandler.ts
│   ├── routes/          # API routes
│   │   ├── auth.routes.ts
│   │   ├── company.routes.ts
│   │   ├── contract.routes.ts
│   │   └── index.ts
│   ├── services/        # Business logic
│   │   ├── web3.service.ts
│   │   └── contract.service.ts
│   ├── utils/           # Utilities
│   │   ├── jwt.ts
│   │   ├── logger.ts
│   │   └── validation.ts
│   ├── __tests__/       # Test files
│   └── index.ts         # Main server file
├── prisma/
│   └── schema.prisma    # Database schema
├── contracts/
│   └── CarbonCredit.abi.json  # Smart contract ABI
├── package.json
├── tsconfig.json
└── .env                 # Environment variables (not in git)
```

## Security Best Practices

1. **JWT Secrets**: Use a strong, random JWT_SECRET in production
2. **HTTPS**: Always use HTTPS in production
3. **Rate Limiting**: Configured on authentication endpoints
4. **CORS**: Configure CORS_ORIGIN to match your frontend domain
5. **Input Validation**: All inputs validated with Joi schemas
6. **Password Hashing**: Bcrypt with 12 rounds
7. **SQL Injection**: Prisma ORM prevents SQL injection
8. **XSS Protection**: Helmet middleware sets security headers

## Troubleshooting

### Database Connection Error

Ensure PostgreSQL is running and DATABASE_URL in `.env` is correct:

```bash
# Test connection
psql $DATABASE_URL
```

### Module Not Found Errors

Delete `node_modules` and reinstall:

```bash
rm -rf node_modules package-lock.json
npm install
```

### Prisma Errors

Regenerate Prisma client:

```bash
npm run prisma:generate
```

## License

MIT

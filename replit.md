# TON Miner Admin Panel

## Overview

This is a Telegram bot-based TON cryptocurrency mining application with an admin dashboard. The system allows users to mine TON through a Telegram bot interface, manage their balances, upgrade mining levels, and request withdrawals. The admin panel provides oversight of users, withdrawal requests, and system statistics.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: TanStack Query (React Query) for server state management with automatic caching and refetching
- **Styling**: Tailwind CSS with shadcn/ui component library (New York style variant)
- **Build Tool**: Vite for fast development and optimized production builds

The frontend is structured as a single-page application with three main pages:
- Dashboard (statistics overview with charts)
- Users (user management table)
- Withdrawals (withdrawal request processing)

### Backend Architecture
- **Runtime**: Node.js with Express.js
- **Language**: TypeScript with ES Modules
- **API Design**: RESTful endpoints defined in shared route contracts with Zod validation
- **Bot Framework**: node-telegram-bot-api for Telegram bot functionality

The server handles both HTTP API requests and Telegram bot interactions. Routes are defined with type-safe contracts in `shared/routes.ts` that are consumed by both frontend and backend.

### Data Storage
- **Database**: PostgreSQL
- **ORM**: Drizzle ORM with drizzle-zod for schema validation
- **Schema Location**: `shared/schema.ts` defines tables for users and withdrawals
- **Migrations**: Managed via drizzle-kit with `db:push` command

Key database tables:
- `users`: Stores Telegram user data, mining balances, levels, and referral information
- `withdrawals`: Tracks withdrawal requests with status workflow (pending → processing → completed/rejected)

### Code Organization
```
├── client/src/          # React frontend
│   ├── components/      # Reusable UI components
│   ├── hooks/           # Custom React hooks including API hooks
│   ├── pages/           # Page components
│   └── lib/             # Utilities and query client
├── server/              # Express backend
│   ├── bot.ts           # Telegram bot logic
│   ├── routes.ts        # API route handlers
│   ├── storage.ts       # Database access layer
│   └── db.ts            # Database connection
├── shared/              # Shared types and contracts
│   ├── schema.ts        # Drizzle database schema
│   └── routes.ts        # API route definitions with Zod
```

### Build Process
- Development: Vite dev server with HMR proxied through Express
- Production: Vite builds frontend to `dist/public`, esbuild bundles server to `dist/index.cjs`

## External Dependencies

### Required Environment Variables
- `DATABASE_URL`: PostgreSQL connection string (required)
- `TELEGRAM_BOT_TOKEN`: Telegram Bot API token (optional, bot won't start without it)

### Third-Party Services
- **Telegram Bot API**: Primary user interface for mining operations
- **PostgreSQL Database**: Persistent data storage (provisioned through Replit)

### Key NPM Packages
- `node-telegram-bot-api`: Telegram bot integration
- `drizzle-orm` + `pg`: Database ORM and PostgreSQL driver
- `@tanstack/react-query`: Frontend data fetching
- `recharts`: Dashboard analytics charts
- `date-fns`: Date formatting utilities
- `zod`: Runtime type validation for API contracts
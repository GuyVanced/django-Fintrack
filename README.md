# FinTrack - Personal Finance Management

A modern, responsive financial management application built with **Next.js 15 App Router** and designed to work with Django REST API backend.

> **✅ Fully converted to Next.js** - No React Router dependencies

## Features

- **Multi-Account Management**: Track multiple bank accounts, credit cards, and digital wallets
- **Transaction Tracking**: Comprehensive income and expense tracking with categorization
- **Budget Planning**: Set and monitor budgets with intelligent alerts
- **Financial Analytics**: Interactive charts and spending pattern insights
- **AI-Powered Insights**: Monthly financial analysis and recommendations
- **Receipt Processing**: OCR-powered receipt scanning and automatic transaction creation
- **Responsive Design**: Beautiful, mobile-first interface
- **Dark/Light Theme**: Automatic theme switching with manual override

## Tech Stack

- **Frontend**: Next.js 15 App Router, React 18, TypeScript
- **Routing**: Next.js file-based routing (no React Router)
- **Styling**: Tailwind CSS, shadcn/ui components
- **State Management**: TanStack React Query, React Context
- **Authentication**: Token-based auth with Django REST API + Next.js middleware
- **Icons**: Lucide React
- **Theme**: Next-themes for dark/light mode

## Quick Start

### Prerequisites

- Node.js 18+
- Django backend with REST API (see [Django Integration Guide](DJANGO_INTEGRATION.md))

### Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd fintrack-nextjs
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Configure environment**

   ```bash
   cp .env.example .env.local
   ```

   Update `NEXT_PUBLIC_API_URL` to your Django backend URL.

4. **Start development server**

   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to `http://localhost:3000`

## Django Backend Setup

This frontend requires a Django REST API backend. See [DJANGO_INTEGRATION.md](DJANGO_INTEGRATION.md) for detailed setup instructions.

### Key API Endpoints Required

- Authentication: `/api/dj-rest-auth/`
- Accounts: `/api/accounts/`
- Transactions: `/api/transactions/`
- Budgets: `/api/budgets/`
- Categories: `/api/category/`
- Master Categories: `/api/master-categories/`

## Project Structure

```
├── app/                          # Next.js App Router (file-based routing)
│   ├── layout.tsx               # Root layout
│   ├── page.tsx                 # Landing page (/)
│   ├── loading.tsx              # Global loading UI
│   ├── not-found.tsx            # 404 page
│   ├── providers.tsx            # React Query & Auth providers
│   ├── globals.css              # Global styles
│   ├── login/page.tsx           # Login page (/login)
│   ├── register/page.tsx        # Register page (/register)
│   ├── dashboard/page.tsx       # Dashboard (/dashboard)
│   ├── accounts/page.tsx        # Accounts (/accounts)
│   ├── transactions/page.tsx    # Transactions (/transactions)
│   ├── budgets/page.tsx         # Budgets (/budgets)
│   ├── categories/page.tsx      # Categories (/categories)
│   └── insights/page.tsx        # Insights (/insights)
├── components/
│   ├── ui/                      # shadcn/ui components
│   ├── DashboardLayout.tsx      # Dashboard layout wrapper
│   └── ProtectedRoute.tsx       # Authentication wrapper
├── contexts/
│   └── AuthContext.tsx          # Authentication state
├── hooks/
│   ├── useFinancialData.ts      # React Query hooks for API
│   └── use-toast.ts             # Toast notifications
├── lib/
│   ├── api.ts                   # Django API client
│   └── utils.ts                 # Utility functions
├── middleware.ts                # Next.js auth middleware
└── next.config.js               # Next.js configuration
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run typecheck` - Run TypeScript checks

## Key Features Implementation

### Authentication

- Token-based authentication with Django REST API
- Automatic token management and refresh
- Protected routes with redirect logic

### Financial Data Management

- Real-time balance calculations
- Transaction filtering by date, type, category
- Multi-account support with account type mapping
- Budget tracking with progress indicators

### User Experience

- Responsive design for all screen sizes
- Dark sidebar with emerald green accent theme
- Loading states and error handling
- Toast notifications for user feedback

## Environment Variables

```env
NEXT_PUBLIC_API_URL=http://localhost:8000  # Django backend URL
NODE_ENV=development                       # Environment
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.

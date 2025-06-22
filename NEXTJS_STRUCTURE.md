# Next.js App Router Project Structure

This project has been fully converted to use Next.js App Router with no React Router dependencies.

## Directory Structure

```
├── app/                          # Next.js App Router (file-based routing)
│   ├── layout.tsx               # Root layout
│   ├── page.tsx                 # Landing page (/)
│   ├── loading.tsx              # Global loading UI
│   ├── not-found.tsx            # 404 page
│   ├── globals.css              # Global styles
│   ├── providers.tsx            # React Query & Auth providers
│   ├── login/page.tsx           # Login page (/login)
│   ├── register/page.tsx        # Register page (/register)
│   ├── dashboard/page.tsx       # Dashboard (/dashboard)
│   ├── accounts/page.tsx        # Accounts page (/accounts)
│   ├── transactions/page.tsx    # Transactions page (/transactions)
│   ├── budgets/page.tsx         # Budgets page (/budgets)
│   ├── categories/page.tsx      # Categories page (/categories)
│   └── insights/page.tsx        # Insights page (/insights)
├── components/
│   ├── ui/                      # Reusable UI components (shadcn/ui)
│   ├── DashboardLayout.tsx      # Dashboard layout wrapper
│   └── ProtectedRoute.tsx       # Authentication wrapper
├── contexts/
│   └── AuthContext.tsx          # Authentication state management
├── hooks/
│   ├── useFinancialData.ts      # React Query hooks for API
│   └── use-toast.ts             # Toast notifications
├── lib/
│   ├── api.ts                   # API client for Django backend
│   └── utils.ts                 # Utility functions
├── middleware.ts                # Next.js middleware for auth
├── next.config.js               # Next.js configuration
└── tailwind.config.ts           # Tailwind CSS configuration
```

## Routing

### File-based Routing (Next.js App Router)

- `/` → `app/page.tsx` (Landing page)
- `/login` → `app/login/page.tsx` (Login)
- `/register` → `app/register/page.tsx` (Registration)
- `/dashboard` → `app/dashboard/page.tsx` (Dashboard)
- `/accounts` → `app/accounts/page.tsx` (Accounts management)
- `/transactions` → `app/transactions/page.tsx` (Transaction history)
- `/budgets` → `app/budgets/page.tsx` (Budget management)
- `/categories` → `app/categories/page.tsx` (Category management)
- `/insights` → `app/insights/page.tsx` (AI insights)

### Authentication Flow

1. **Middleware**: `middleware.ts` handles route protection
2. **Protected Routes**: Dashboard and financial pages require authentication
3. **Auth Routes**: Login/register redirect to dashboard if already authenticated
4. **Cookies**: Authentication state stored in both localStorage and cookies for SSR

### Navigation

- **Next.js Link**: All navigation uses `next/link` instead of React Router
- **useRouter**: Uses `next/navigation` for programmatic navigation
- **usePathname**: Uses `next/navigation` for current path detection

## Key Features

### Authentication

- Token-based auth with Django REST API
- Cookie + localStorage storage for SSR compatibility
- Automatic redirects via middleware
- Protected route wrapper component

### Data Management

- React Query for server state
- Comprehensive hooks in `hooks/useFinancialData.ts`
- Optimistic updates and cache invalidation
- Error handling and retry logic

### UI Components

- shadcn/ui component library
- Tailwind CSS for styling
- Dark emerald sidebar theme
- Responsive design for all screen sizes

### Backend Integration

- Django REST API client
- Complete CRUD operations
- Advanced filtering and pagination
- AI features and receipt processing

## Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

## Environment Variables

```env
NEXT_PUBLIC_API_URL=http://localhost:8000  # Django backend URL
NODE_ENV=development
```

## Migration from React Router

The following changes were made to convert from React Router to Next.js:

1. **Removed React Router dependencies**
2. **Converted all page components** to Next.js App Router structure
3. **Updated navigation** to use Next.js `Link` and `useRouter`
4. **Added middleware** for authentication handling
5. **Enhanced auth context** with cookie support for SSR
6. **Reorganized file structure** to follow Next.js conventions

## No Legacy Code

All React Router code has been removed:

- ❌ No `react-router-dom` imports
- ❌ No `BrowserRouter`, `Routes`, `Route` components
- ❌ No `useNavigate`, `useLocation` hooks from React Router
- ❌ No `src/pages` directory with React Router pages
- ✅ Pure Next.js App Router implementation

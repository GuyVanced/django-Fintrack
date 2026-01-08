# FinTrack - Personal Finance Management

A modern, full-stack personal finance management application. **FinTrack** helps users track accounts, transactions, budgets, and AI-powered financial insights. Built with **Next.js 15** (frontend) and **Django REST Framework** (backend).

---

## 🚀 Features

- **Multi-Account Management**: Track bank accounts, credit cards, wallets
- **Transaction Tracking**: Categorize income/expenses, recurring transactions
- **Budget Planning**: Set, monitor, and get alerts for budgets
- **Financial Analytics**: Interactive charts, spending insights
- **AI Insights**: Monthly analysis & recommendations (LLM-powered)
- **Receipt OCR**: Scan receipts, auto-create transactions
- **Responsive UI**: Mobile-first, dark/light theme
- **Secure Auth**: Token-based authentication

---

## 🏗️ Architecture

### Frontend
- **Framework**: Next.js 15 App Router, React 18, TypeScript
- **Styling**: Tailwind CSS, shadcn/ui
- **State**: TanStack React Query, React Context
- **Auth**: Token-based, Next.js middleware
- **Other**: Lucide React icons, next-themes

### Backend
- **Framework**: Django 5, Django REST Framework
- **Auth**: dj-rest-auth, django-allauth
- **Async Tasks**: Celery, Redis
- **AI/LLM**: Google Generative AI integration
- **OCR**: Receipt image processing
- **Database**: PostgreSQL (via Docker)

---

## 📂 Project Structure

```
Finance-Tracker/
├── Frontend/           # Next.js frontend
│   ├── app/            # App Router pages
│   ├── components/     # UI & layout components
│   ├── contexts/       # React Contexts
│   ├── hooks/          # Custom hooks
│   ├── lib/            # API client, utils
│   ├── public/         # Static assets
│   └── ...
├── Backend/            # Django backend
│   ├── djangoBackend/  # Django project config
│   ├── fintrack_app/   # Main app (models, views, services)
│   ├── requirements.txt
│   ├── docker-compose.yml
│   └── ...
└── README.md           # (You are here)
```

---

## ⚙️ Quick Start

### Prerequisites
- Node.js 18+
- Python 3.10+
- Docker (for DB, recommended)

### 1. Clone the Repository
```bash
git clone <repository-url>
cd Finance-Tracker
```

### 2. Backend Setup (Django)
```bash
cd Backend
python -m venv venv
source venv/bin/activate  # or venv\Scripts\activate on Windows
pip install -r requirements.txt
cp .env.example .env  # create and edit environment variables
# Start PostgreSQL via Docker (recommended)
docker-compose up -d
# Run migrations
python manage.py migrate
# (Optional) Create superuser
python manage.py createsuperuser
# Start backend server
python manage.py runserver
```

### 3. Frontend Setup (Next.js)
```bash
cd ../Frontend
npm install
cp .env.example .env.local  # set NEXT_PUBLIC_API_URL to backend
npm run dev
```

- Frontend: http://localhost:3000
- Backend API: http://localhost:8000/api/

---

## 🔑 API Overview

The backend exposes a RESTful API for all resources. Authentication is via token (dj-rest-auth).

### Main Endpoints
- **Auth**: `/api/dj-rest-auth/`, `/api/dj-rest-auth/registration/`
- **Accounts**: `/api/accounts/`
- **Transactions**: `/api/transactions/`
- **Budgets**: `/api/budgets/`
- **Categories**: `/api/category/`, `/api/master-categories/`
- **AI Insights**: `/api/ai/insights/`
- **Receipt OCR**: `/api/ai/receipt/process`, `/api/ai/receipt/create`

See [`Backend/docs.md`](Backend/docs.md) for full API details, request/response samples, and error codes.

---

## 🧩 Tech Stack

### Frontend
- Next.js 15, React 18, TypeScript
- Tailwind CSS, shadcn/ui, Lucide React
- TanStack React Query, next-themes

### Backend
- Django 5, Django REST Framework
- dj-rest-auth, django-allauth
- Celery, Redis, PostgreSQL
- Google Generative AI, OCR

---

## 🗂️ Key Features Implementation

- **Authentication**: Token-based, auto-refresh, protected routes
- **Financial Data**: Real-time balances, filtering, multi-account
- **Budgets**: Progress tracking, alerts
- **AI Insights**: LLM-powered monthly summaries
- **Receipt OCR**: Image upload, auto-transaction
- **User Experience**: Responsive, dark/light, toasts, error handling

---

## 🛠️ Development Scripts

- `npm run dev` (frontend) - Start Next.js dev server
- `npm run build` (frontend) - Build frontend
- `npm run start` (frontend) - Start production frontend
- `python manage.py runserver` (backend) - Start Django dev server
- `docker-compose up -d` (backend) - Start DB via Docker

---

## 🌍 Environment Variables

### Frontend (`Frontend/.env.local`)
```
NEXT_PUBLIC_API_URL=http://localhost:8000
```

### Backend (`Backend/.env`)
- See `Backend/.env.example` for all variables (DB, secret keys, etc.)

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

---

## 📄 License

This project is licensed under the MIT License. 

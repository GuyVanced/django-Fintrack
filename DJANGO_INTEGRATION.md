# Django Backend Integration Guide

## Required Django Backend Configuration

### 1. CORS Configuration

Add to your Django `settings.py`:

```python
# Install django-cors-headers first: pip install django-cors-headers

INSTALLED_APPS = [
    # ... other apps
    'corsheaders',
    'rest_framework',
    'rest_framework.authtoken',
]

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.common.CommonMiddleware',
    # ... other middleware
]

# CORS settings for development
CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000",  # Next.js development server
    "http://127.0.0.1:3000",
]

# For production, be more specific with your domain
# CORS_ALLOWED_ORIGINS = [
#     "https://yourdomain.com",
# ]

# REST Framework configuration
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': [
        'rest_framework.authentication.TokenAuthentication',
    ],
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.IsAuthenticated',
    ],
    'DEFAULT_PAGINATION_CLASS': 'rest_framework.pagination.PageNumberPagination',
    'PAGE_SIZE': 20,
}
```

### 2. URL Configuration

Make sure your Django `urls.py` includes:

```python
from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('your_app.urls')),  # Your API endpoints
    path('api/dj-rest-auth/', include('dj_rest_auth.urls')),  # Authentication
]
```

### 3. Token Authentication

Ensure you have created the necessary database tables:

```bash
python manage.py makemigrations
python manage.py migrate
```

### 4. Frontend Configuration

Update your `.env.local` file:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

For production, update to your Django server URL:

```env
NEXT_PUBLIC_API_URL=https://your-django-api.com
```

## API Endpoints Expected

The frontend expects these Django REST API endpoints:

### Authentication

- `POST /api/dj-rest-auth/login/`
- `POST /api/dj-rest-auth/registration/`
- `POST /api/dj-rest-auth/logout/`

### Core Endpoints

- `GET/POST /api/accounts/`
- `GET/PUT/PATCH/DELETE /api/accounts/{id}/`
- `GET/POST /api/transactions/`
- `GET/PUT/PATCH/DELETE /api/transactions/{id}/`
- `GET/POST /api/budgets/`
- `GET/PUT/PATCH/DELETE /api/budgets/{id}/`
- `GET/POST /api/category/`
- `GET/PUT/DELETE /api/category/{id}/`
- `GET /api/master-categories/`

### AI Features (Optional)

- `POST /api/ai/insights/`
- `POST /api/ai/receipt/process`
- `POST /api/ai/receipt/create`

## Development

1. Start your Django development server:

   ```bash
   python manage.py runserver
   ```

2. Start the Next.js development server:
   ```bash
   npm run dev
   ```

The Next.js app will be available at `http://localhost:3000` and will connect to your Django API at `http://localhost:8000`.

## Troubleshooting

### CORS Issues

If you see CORS errors in the browser console, make sure:

1. `django-cors-headers` is installed and configured
2. Your Next.js URL is in `CORS_ALLOWED_ORIGINS`
3. The middleware order is correct

### Authentication Issues

If login/registration fails:

1. Check that `rest_framework.authtoken` is in `INSTALLED_APPS`
2. Ensure migrations have been run
3. Verify the authentication endpoints are accessible

### 404 Errors

If API calls return 404:

1. Check your Django URL patterns
2. Ensure the API endpoints match what the frontend expects
3. Verify your Django server is running on the correct port

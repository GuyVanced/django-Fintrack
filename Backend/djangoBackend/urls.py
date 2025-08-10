"""
URL configuration for djangoBackend project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path,include
from django.http import JsonResponse

def api_root(request):
    """API root endpoint showing available endpoints."""
    return JsonResponse({
        'message': 'FinTrack API is running!',
        'endpoints': {
            'authentication': '/api/dj-rest-auth/',
            'accounts': '/api/accounts/',
            'transactions': '/api/transactions/',
            'budgets': '/api/budgets/',
            'categories': '/api/category/',
            'financial_summary': '/api/financial-summary/',
            'ai_insights': '/api/ai/insights/',
            'admin': '/admin/'
        }
    })

urlpatterns = [
    path('', api_root, name='api-root'),
    path('admin/', admin.site.urls),
    path('api/',include('fintrack_app.urls')),
    path('api-auth/',include('rest_framework.urls')),
]

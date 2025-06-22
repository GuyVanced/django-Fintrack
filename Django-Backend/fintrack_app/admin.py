from django.contrib import admin
from .models import (
    Account,
    Transaction,
    Budget,
    UserCategory,
    MasterCategory,
)

@admin.register(Account)
class AccountAdmin(admin.ModelAdmin):
    # remove wallet_number, add balance and institution
    list_display = [
        'user',
        'name',
        'account_type',
        'balance',
        'account_number',
        'institution',
    ]
    # if you want to hide created_at/updated_at in the form:
    exclude = ['created_at', 'updated_at']

@admin.register(Transaction)
class TransactionAdmin(admin.ModelAdmin):
    exclude = ['createdAt']
    list_display = [
        'id',
        'user',
        'transaction_type',
        'category',
        'amount',
        'account',
        'date',
        'isRecurring',
    ]
    list_filter = ['transaction_type', 'date']
    search_fields = ['description']

@admin.register(UserCategory)
class UserCategoryAdmin(admin.ModelAdmin):
    list_display = [
        'user',
        'master_category',
        'total_amount',
    ]
    list_filter = ['master_category__transaction_type']
    search_fields = ['master_category__name']

@admin.register(Budget)
class BudgetAdmin(admin.ModelAdmin):
    exclude = ['createdAt', 'last_reset']
    list_display = [
        'user',
        'category',
        'budget_amount',
        'is_exceed',
    ]
    list_filter = ['is_exceed']
    search_fields = ['category__master_category__name']

@admin.register(MasterCategory)
class MasterCategoryAdmin(admin.ModelAdmin):
    list_display = [
        'id',
        'transaction_type',
        'name',
    ]
    list_filter = ['transaction_type']
    search_fields = ['name']

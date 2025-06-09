from django.contrib import admin
# from .models import User, Account, Transaction, Budget
from .models import  Account, Transaction, Budget


# class UserAdmin(admin.ModelAdmin):
#     exclude = ['createdAt', 'updatedAt']
#     search_fields = ['name']
#     list_display = [ 'email', 'name']


class AccountAdmin(admin.ModelAdmin):
    exclude = ['createdAt', 'updatedAt']
    # list_display = ['name', 'account_type',
    #                 'account_number', 'wallet_number', 'user']
    list_display = ['name', 'account_type',
                    'account_number', 'wallet_number']


class TransactionAdmin(admin.ModelAdmin):
    exclude = ['createdAt', 'updatedAt']
    # list_display = ['category', 'transaction_type', 'amount', 'user']
    list_display = ['category', 'transaction_type', 'amount']


class BudgetAdmin(admin.ModelAdmin):
    exclude = ['createdAt', 'updatedAt']
    # list_display = ['transaction', 'amount', 'user',]
    list_display = ['transaction', 'amount',]


# admin.site.register(User, UserAdmin)
admin.site.register(Account, AccountAdmin)
admin.site.register(Transaction, TransactionAdmin)
admin.site.register(Budget, BudgetAdmin)
# admin.site.register(Account_type, Account_typeAdmin)

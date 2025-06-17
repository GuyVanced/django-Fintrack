from django.contrib import admin
# from .models import User, Account, Transaction, Budget
from .models import  Account, Transaction, Budget,Category



class AccountAdmin(admin.ModelAdmin):
    exclude = ['createdAt', 'updatedAt']
    # list_display = ['name', 'account_type',
    #                 'account_number', 'wallet_number', 'user']
    list_display = ['name', 'account_type',
                    'account_number', 'wallet_number']


class TransactionAdmin(admin.ModelAdmin):
    exclude = ['createdAt', 'updatedAt']
    # list_display = ['category', 'transaction_type', 'amount', 'user']
    list_display = ['category', 'transaction_type', 'amount','user','account']


class CategoryAdmin(admin.ModelAdmin):
    list_display=['category','user','total_amount']


class BudgetAdmin(admin.ModelAdmin):
    list_display=['user','budget_amount']    

admin.site.register(Account, AccountAdmin)
admin.site.register(Transaction, TransactionAdmin)
admin.site.register(Category,CategoryAdmin)
admin.site.register(Budget,BudgetAdmin)


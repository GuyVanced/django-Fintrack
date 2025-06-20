from rest_framework import serializers
from fintrack_app.models import Transaction
from django.db import transaction as db_transaction
import logging
logger=logging.getLogger(__name__)
from fintrack_app.services.budget_service import BudgetService

class TransactionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Transaction
        fields = [
            'id', 'user', 'transaction_type', 'account', 'amount', 'description', 'date',
            'category', 'receiptPath', 'isRecurring', 'recurringInterval',
            'nextRecurringDate', 'lastProcessedDate'
        ]

    @db_transaction.atomic
    def create(self, validated_data):
        transaction_type = serializers.ChoiceField(
            choices=Transaction.Transaction_type.choices,
            default=Transaction.Transaction_type.MYEXPENSE,
            required=False
        )
        account = validated_data['account']
        amount = validated_data['amount']
        category = validated_data['category']

        # Update account balance
        if transaction_type == Transaction.Transaction_type.MYINCOME:
            account.balance += amount
        elif transaction_type == Transaction.Transaction_type.MYEXPENSE:
            account.balance -= amount
        account.save()

        if amount:
            category.total_amount+=amount
        category.save()

        BudgetService.check_and_notify_budget(category)

        return super().create(validated_data)

    @db_transaction.atomic
    def update(self,instance,validated_data):
        old_type=instance.transaction_type
        old_amount=instance.amount
        old_account=instance.account
        old_category=instance.category

        new_type=validated_data.get('transaction_type',old_type)
        new_amount=validated_data.get('amount',old_amount)
        new_account=validated_data.get('account',old_account)
        new_category=validated_data.get('category',old_category)


        type_changed=old_type!=new_type
        account_changed=old_account!=new_account
        category_changed=old_category!=new_category

        if type_changed or account_changed:
            if old_type ==Transaction.Transaction_type.MYINCOME:
                old_account.balance-=old_amount
            else:
                old_account.balance+=old_amount
            old_account.save()   

            if new_type==Transaction.Transaction_type.MYINCOME:
                new_account.balance+=new_amount
            else:
                new_account.balance-=new_amount
            new_account.save()         
        else:
            #just update the difference
            delta=new_amount-old_amount
            if new_type==Transaction.Transaction_type.MYINCOME:
                new_account.balance+=delta
            else:
                new_account.balance-=delta

            new_account.save()    


        if category_changed:
            old_category.total_amount-=old_amount
            new_category.total_amount+=new_amount   
        else:
            delta=new_amount-old_amount
            new_category.total_amount+=delta

        old_category.save()
        new_category.save()    

        BudgetService.check_and_notify_budget(new_category)
        if category_changed:
            BudgetService.check_and_notify_budget(old_category)




        return super().update(instance,validated_data)
           







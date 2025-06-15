from rest_framework import serializers
from fintrack_app.models import Transaction
from django.db import transaction as db_transaction
import logging
logger=logging.getLogger(__name__)

class TransactionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Transaction
        fields = [
            'id', 'user', 'transaction_type', 'account', 'amount', 'description', 'date',
            'category', 'receiptUrl', 'isRecurring', 'recurringInterval',
            'nextRecurringDate', 'lastProcessedDate'
        ]

    @db_transaction.atomic
    def create(self, validated_data):
        transaction_type = validated_data['transaction_type']
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

        return super().create(validated_data)

    @db_transaction.atomic
    # def update(self, instance, validated_data):
    #     old_type = instance.transaction_type
    #     old_amount = instance.amount
    #     old_account = instance.account
    #     old_category = instance.category
        




    #     # Reverse old account balance
    #     if old_type == Transaction.Transaction_type.MYINCOME:
    #         old_account.balance -= old_amount
    #     else:
    #         old_account.balance += old_amount
    #     old_account.save()
        
    #     if old_amount:
    #         old_category.total_amount-=old_amount

    #     old_category.save()    




    #     # Update the instance with new values
    #     updated_instance = super().update(instance, validated_data)

    #     new_type = validated_data.get('transaction_type', old_type)
    #     new_amount = validated_data.get('amount', old_amount)
    #     new_account = validated_data.get('account', old_account)
    #     new_category = validated_data.get('category', old_category)

    #     # Update new account balance
    #     if new_type == Transaction.Transaction_type.MYINCOME:
    #         new_account.balance += new_amount
    #     else:
    #         new_account.balance -= new_amount
    #     new_account.save()

    #     if new_amount:
    #         new_category.total_amount+=new_amount

    #     new_category.save()  
        


    #     return updated_instance

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

        return super().update(instance,validated_data)
           







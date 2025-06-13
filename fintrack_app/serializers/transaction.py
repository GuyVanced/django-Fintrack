# from rest_framework import serializers
# from fintrack_app.models import Transaction
# from django.db import transaction as db_transaction
# class TransactionSerializer(serializers.ModelSerializer):
#     class Meta:
#         model=Transaction
#         # fields=['id','account_type','isWallet','isDefault','user','name','account_number','wallet_number','balance','description']
#         fields=['id','user','transaction_type','account','amount','description','date','category','receiptUrl','isRecurring','recurringInterval','nextRecurringDate','lastProcessedDate']
        


#     def validate(self,validated_data):
#         errors={}
#         if validated_data.get('isRecurring'):
#                 if not validated_data.get('recurringInterval') and not validated_data.get('nextRecurringDate'):
#                     errors['recurringInterval']='recurringInterval is required for recurring transactions'
#                     errors['nextRecurringDate']='nextRecurringDate is required for recurring transactions'
        
#         if validated_data.get('category') is None:
#              errors['category']='category is required bro.'    

            
#         if errors:
#             raise serializers.ValidationError(errors)
        
#         return validated_data


#     @db_transaction.atomic
#     def create(self,validated_data):
#             transaction_type=validated_data['transaction_type']
#             account=validated_data['account']
#             amount=validated_data['amount']

#             if transaction_type=='In':
#                 account.balance+=amount
#             elif transaction_type=='Ex':
#                 account.balance-=amount


#             account.save()

#             return super().create(validated_data)    

                       

#     @db_transaction.atomic
#     def update(self,instance,validated_data):
         
#          #Reverse the old balance effect

#          old_type=instance.transaction_type
#          old_amount=instance.amount
#          old_account=instance.account

#          if old_type=='In':
#               old_account.balance-=old_amount
#          else:
#               old_account.balance+=old_amount 

#          old_account.save()     


#          #update the instance with new values
#          updated_instance=super().update(instance,validated_data)

#          new_type=validated_data.get('transaction_type',old_type)    
#          new_amount=validated_data.get('amount',old_amount)
#          new_account=validated_data.get('account',old_account)

#          if new_type=='In':
#               new_account.balance+=new_amount
#          else:
#               new_account.balance-=new_amount
#          new_account.save()    

#          if new_type==old_type and new_account==old_account:
#               new_amount+=validated_data.get('amount')  

#          return updated_instance    
             






from rest_framework import serializers
from fintrack_app.models import Transaction, CategoryTotal
from django.db import transaction as db_transaction
import logging
logger=logging.getLogger(__name__)

class TransactionSerializer(serializers.ModelSerializer):
    # user = serializers.PrimaryKeyRelatedField(read_only=True)
    class Meta:
        model = Transaction
        fields = [
            'id', 'user', 'transaction_type', 'account', 'amount', 'description', 'date',
            'category', 'receiptUrl', 'isRecurring', 'recurringInterval',
            'nextRecurringDate', 'lastProcessedDate'
        ]
                # An alternative way to make the user read-only
        # extra_kwargs = {'user': {'read_only': True}}
        

    def validate(self, validated_data):
        errors = {}
        if validated_data.get('isRecurring'):
            if not validated_data.get('recurringInterval') or not validated_data.get('nextRecurringDate'):
                errors['recurringInterval'] = 'recurringInterval is required for recurring transactions'
                errors['nextRecurringDate'] = 'nextRecurringDate is required for recurring transactions'

        if validated_data.get('category') is None:
            errors['category'] = 'category is required bro.'

        if errors:
            raise serializers.ValidationError(errors)

        return validated_data

    def update_category_total(self, user, account, category, transaction_type, delta_amount):
        category_total, created = CategoryTotal.objects.get_or_create(
            user=user,
            account=account,
            category=category,
            transaction_type=transaction_type,
            defaults={'total_amount': 0}
        )
        category_total.total_amount += delta_amount
                # Ensure total_amount doesn't go below zero for expenses if that's desired behavior
        if category_total.total_amount < 0 and transaction_type == Transaction.Transaction_type.MYEXPENSE:
            category_total.total_amount = 0

        logger.info(f"Updating CatgeoryTotal for user {user} , category {category} , account {account} , delta {delta_amount}")    

        category_total.save()



    @db_transaction.atomic
    def create(self, validated_data):
        transaction_type = validated_data['transaction_type']
        account = validated_data['account']
        amount = validated_data['amount']
        user = validated_data['user']
        category = validated_data['category']

        # Update account balance
        if transaction_type == Transaction.Transaction_type.MYINCOME:
            account.balance += amount
        elif transaction_type == Transaction.Transaction_type.MYEXPENSE:
            account.balance -= amount
        account.save()

        # Update category total
        self.update_category_total(user, account, category, transaction_type, amount)

        return super().create(validated_data)

    @db_transaction.atomic
    def update(self, instance, validated_data):
        old_type = instance.transaction_type
        old_amount = instance.amount
        old_account = instance.account
        old_category = instance.category
        user = instance.user


        # Reverse old account balance
        if old_type == Transaction.Transaction_type.MYINCOME:
            old_account.balance -= old_amount
        else:
            old_account.balance += old_amount
        old_account.save()

        self.update_category_total(user, old_account, old_category, old_type, -old_amount) # Subtract old amount



        # Update the instance with new values
        updated_instance = super().update(instance, validated_data)

        new_type = validated_data.get('transaction_type', old_type)
        new_amount = validated_data.get('amount', old_amount)
        new_account = validated_data.get('account', old_account)
        new_category = validated_data.get('category', old_category)

        # Update new account balance
        if new_type == Transaction.Transaction_type.MYINCOME:
            new_account.balance += new_amount
        else:
            new_account.balance -= new_amount
        new_account.save()

        # Update category total with new values
        self.update_category_total(user, new_account, new_category, new_type, new_amount)

        return updated_instance

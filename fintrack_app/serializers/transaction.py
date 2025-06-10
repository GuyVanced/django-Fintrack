from rest_framework import serializers
from fintrack_app.models import Transaction
from django.db import transaction as db_transaction
class TransactionSerializer(serializers.ModelSerializer):
    class Meta:
        model=Transaction
        # fields=['id','account_type','isWallet','isDefault','user','name','account_number','wallet_number','balance','description']
        fields=['id','user','transaction_type','account','amount','description','date','category','receiptUrl','isRecurring','recurringInterval','nextRecurringDate','lastProcessedDate']
        


    def validate(self,validated_data):
        errors={}
        if validated_data.get('isRecurring'):
                if not validated_data.get('recurringInterval') and not validated_data.get('nextRecurringDate'):
                    errors['recurringInterval']='recurringInterval is required for recurring transactions'
                    errors['nextRecurringDate']='nextRecurringDate is required for recurring transactions'
        
        if validated_data.get('category') is None:
             errors['category']='category is required bro.'    

            
        if errors:
            raise serializers.ValidationError(errors)
        
        return validated_data


    @db_transaction.atomic
    def create(self,validated_data):
            transaction_type=validated_data['transaction_type']
            account=validated_data['account']
            amount=validated_data['amount']

            if transaction_type=='In':
                account.balance+=amount
            elif transaction_type=='Ex':
                account.balance-=amount


            account.save()

            return super().create(validated_data)    

                       

    @db_transaction.atomic
    def update(self,instance,validated_data):
         
         #Reverse the old balance effect

         old_type=instance.transaction_type
         old_amount=instance.amount
         old_account=instance.account

         if old_type=='In':
              old_account.balance-=old_amount
         else:
              old_account.balance+=old_amount 

         old_account.save()     


         #update the instance with new values
         updated_instance=super().update(instance,validated_data)

         new_type=validated_data.get('transaction_type',old_type)    
         new_amount=validated_data.get('amount',old_amount)
         new_account=validated_data.get('account',old_account)

         if new_type=='In':
              new_account.balance+=new_amount
         else:
              new_account.balance-=new_amount
         new_account.save()      

         return updated_instance    
             
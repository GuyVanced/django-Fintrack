from rest_framework import serializers
from fintrack_app.models import Transaction

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
             errors['category']='category is required.'    

            
        if errors:
            raise serializers.ValidationError(errors)
        
        return validated_data
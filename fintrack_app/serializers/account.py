from rest_framework import serializers
from fintrack_app.models import Account

class AccountSerializer(serializers.ModelSerializer):
    class Meta:
        model=Account
        # fields=['id','account_type','isWallet','isDefault','user','name','account_number','wallet_number','balance','description']
        fields=['id','account_type','isWallet','isDefault','name','account_number','wallet_number','balance','description']
        


    def validate(self,validated_data):
        errors={}
        if validated_data.get('account_type') is None:
            errors['account_type']='account_type is required'
        else:
            if validated_data.get('isWallet'):
                if not validated_data.get('wallet_number'):
                    errors['wallet_number']='wallet_number is required for wallet accounts'
                if validated_data.get('account_number'):
                    errors['account_number']='account_number must be empty for wallet accounts'
            else:
                if not validated_data.get('account_number'):
                    errors['account_number']='account_number is required for non-wallet accounts'
                
                if validated_data.get('wallet_number'):
                    errors['wallet_number']='wallet_number must be empty for non-wallet accounts'
        if errors:
            raise serializers.ValidationError(errors)
        
        return validated_data
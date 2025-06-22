# fintrack_app/serializers/account.py

from rest_framework import serializers
from fintrack_app.models.account import Account

class AccountSerializer(serializers.ModelSerializer):
    class Meta:
        model = Account
        fields = [
            'id',
            'account_type',
            'name',
            'balance',
            'account_number',
            'institution',
        ]
        read_only_fields = ['id']

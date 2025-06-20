# fintrack_app/serializers/category.py
from rest_framework import serializers
from fintrack_app.models import Category

class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ['id','transaction_type','category','total_amount']
        read_only_fields = ['id','total_amount']

    def validate(self, attrs):
        tx_type = attrs.get('transaction_type')
        cat     = attrs.get('category')
        # build sets for quick membership checks:
        income_names  = {c.value for c in Category.NameChoices if c.name in ['SALARY','INVESTMENTS','FREELANCE','OTHERS']}
        expense_names = {c.value for c in Category.NameChoices if c.name not in ['SALARY','INVESTMENTS','FREELANCE','OTHERS']}
        if tx_type == Category.TransactionType.INCOME and cat not in income_names:
            raise serializers.ValidationError({'category': 'Must be one of the defined income categories.'})
        if tx_type == Category.TransactionType.EXPENSE and cat not in expense_names:
            raise serializers.ValidationError({'category': 'Must be one of the defined expense categories.'})
        return attrs

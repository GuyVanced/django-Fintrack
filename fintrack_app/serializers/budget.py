from fintrack_app.models import Budget
from rest_framework import serializers

class BudgetSerializer(serializers.ModelSerializer):
    class Meta:
        model=Budget
        fields=['id','user','amount','transaction']



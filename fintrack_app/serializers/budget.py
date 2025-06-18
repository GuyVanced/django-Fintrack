from fintrack_app.models import Budget
from rest_framework import serializers
from fintrack_app.services.email_service import EmailService

class BudgetSerializer(serializers.ModelSerializer):
    class Meta:
        model=Budget
        fields=['id','user','budget_amount','is_exceed','category']
        

        def validate(self,validated_data):

            user=self.context['request'].user
            validated_data['user']=user  ##assign user from context
            return validated_data 
        

        

        



           



            








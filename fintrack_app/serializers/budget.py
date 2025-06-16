from fintrack_app.models import Budget
from rest_framework import serializers
from fintrack_app.services.email_service import EmailService

class BudgetSerializer(serializers.ModelSerializer):
    class Meta:
        model=Budget
        fields=['id','user','amount','budget_amount','is_exceed','category']
        

        def validate(self,validated_data):
            category=validated_data.get('category')
            budget_amount=validated_data.get('budget')
            user=self.context['request'].user

            if category and budget_amount is not None:
                if category.total_amount>budget_amount:
                    validated_data['is_exceed']=True
                    #send alert email
                    EmailService.send_budget_alert(
                        user=user,
                        category=category,
                        total=category.total_amount,
                        budget_limit=budget_amount
                         )
  
                else:
                    validated_data['is_exceed']=False

                validated_data['user']=user  ##assign yser from context
                return validated_data            



            








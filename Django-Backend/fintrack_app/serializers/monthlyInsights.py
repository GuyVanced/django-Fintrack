from rest_framework import serializers
from fintrack_app.models.monthlyInsights import MonthlyInsight

class MonthlyInsightSerializer(serializers.ModelSerializer):
    class Meta:
        model = MonthlyInsight
        fields = ['id','period_start', 'period_end', 'prompt_payload', 'llm_response', 'created_at']

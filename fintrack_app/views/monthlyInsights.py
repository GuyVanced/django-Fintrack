from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from datetime import date

from fintrack_app.services.insights.generator import generate_monthly_insight
from fintrack_app.serializers.monthlyInsights import MonthlyInsightSerializer
from fintrack_app.models.monthlyInsights import MonthlyInsight

class MonthlyInsightView(APIView):
    """
    POST /api/ai/insights/  
    Body: { "year": 2025, "month": 6 }
    """
    permission_classes = [IsAuthenticated]

    def post(self, request):
        year = request.data.get('year')
        month = request.data.get('month')
        if not (year and month):
            today = date.today()
            year, month = today.year, today.month

        try:
            summary = generate_monthly_insight(request.user, int(year), int(month))
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

        # Fetch the saved insight for full data

        
        # Safely fetch the first matching insight
        insight = MonthlyInsight.objects.filter(
            user=request.user,
            period_start__year=year,
            period_start__month=month
        ).first()

        if insight is None:
            return Response({"error": "Insight not found after generation."}, status=status.HTTP_404_NOT_FOUND)



        serializer = MonthlyInsightSerializer(insight)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

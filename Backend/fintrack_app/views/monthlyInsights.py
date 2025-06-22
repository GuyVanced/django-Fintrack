from rest_framework.views import APIView 
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from datetime import date
from rest_framework.generics import ListAPIView, RetrieveDestroyAPIView


from fintrack_app.services.insights.generator import generate_monthly_insight
from fintrack_app.serializers.monthlyInsights import MonthlyInsightSerializer
from fintrack_app.models.monthlyInsights import MonthlyInsight
from fintrack_app.models.transaction import Transaction    

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

            # **NEW**: bail out early if no transactions in that month
        has_tx = Transaction.objects.filter(
            user=request.user,
            date__year=year,
            date__month=month
        ).exists()
        if not has_tx:
            return Response(
                {"detail": f"No transactions found for {year}-{month:02d}."},
                status=status.HTTP_400_BAD_REQUEST
            )

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

        # return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(
            {
                "report": summary,               # the LLM text/dict
                "insight_record": serializer.data
            },
            status=status.HTTP_200_OK
        )
    

class MonthlyInsightListView(ListAPIView):
    """
    GET  /api/monthly-insights/         -> list all insights for the authenticated user
    """
    serializer_class = MonthlyInsightSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        return MonthlyInsight.objects.filter(user=user)


class MonthlyInsightRetrieveDestroyView(RetrieveDestroyAPIView):
    """
    GET    /api/monthly-insights/{id}/  -> retrieve a single insight
    DELETE /api/monthly-insights/{id}/  -> delete that insight
    """
    serializer_class = MonthlyInsightSerializer
    permission_classes = [IsAuthenticated]
    lookup_field = 'id'

    def get_queryset(self):
        user = self.request.user
        return MonthlyInsight.objects.filter(user=user)

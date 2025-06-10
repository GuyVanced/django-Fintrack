from rest_framework.views import APIView
from django.utils.dateparse import parse_datetime
from fintrack_app.models import Transaction
from rest_framework.response import Response
from django.db.models import Sum

class CategorySummaryView(APIView):
    def get(self,request):
        # user=request.user
        category=request.query_params.get('category')
        transaction_type=request.query_params.get('transaction_type')
        start_date=request.query_params.get('start_date')
        end_date=request.query_params.get('end_date')


        filters={}
        if category:
            filters['category']=category
        if transaction_type:
            filters['transaction_type']=transaction_type
        if start_date:
            filters['date__gte']=parse_datetime(start_date)
        if end_date:
            filters['date_lte']=parse_datetime(end_date)

# '\' helps to go to next line
        data=Transaction.objects.filter(**filters)\
            .values('category')\
                .annotate(total=Sum('amount'))    

        return Response(data)    
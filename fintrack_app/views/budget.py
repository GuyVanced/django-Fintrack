from fintrack_app.serializers.budget import BudgetSerializer
from fintrack_app.models import Budget

from rest_framework.generics import ListCreateAPIView,RetrieveUpdateDestroyAPIView

class BudgetListCreateView(ListCreateAPIView):
    serializer_class=BudgetSerializer
    queryset=Budget.objects.all()


class BudgetRetrieveUpdateDestroyView(RetrieveUpdateDestroyAPIView):
    serializer_class=BudgetSerializer
    lookup_field='id'
    queryset=Budget.objects.all()
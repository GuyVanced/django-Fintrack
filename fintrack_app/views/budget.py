from fintrack_app.serializers.budget import BudgetSerializer
from fintrack_app.models import Budget

from rest_framework.generics import ListCreateAPIView,RetrieveUpdateDestroyAPIView

class BudgetListCreateView(ListCreateAPIView):
    serializer_class=BudgetSerializer
    
    def get_queryset(self):
        user=self.request.user
        queryset=Budget.objects.filter(user=user)
        return queryset


class BudgetRetrieveUpdateDestroyView(RetrieveUpdateDestroyAPIView):
    serializer_class=BudgetSerializer
    lookup_field='id'
    
    def get_queryset(self):
        user=self.request.user
        queryset=Budget.objects.filter(user=user)
        return queryset
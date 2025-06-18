from fintrack_app.serializers.budget import BudgetSerializer
from fintrack_app.models import Budget

from rest_framework.generics import ListCreateAPIView,RetrieveUpdateDestroyAPIView
from django.utils.timezone import now


class BudgetListCreateView(ListCreateAPIView):
    serializer_class=BudgetSerializer
    
    def get_queryset(self):
        user=self.request.user
        # queryset=Budget.objects.filter(user=user)
        budgets=Budget.objects.filter(user=user)
        # for budget in budgets:
        #     if (now().date()-budget.createdAt.date()).days>30:
        #         if budget.budget_amount !=0:
        #             budget.budget_amount=0
        #             budget.save(update_fields=["budget_amount"])


        return budgets
    
    def perform_create(self,serializer):
        user=self.request.user
        serializer.save(user=user)


class BudgetRetrieveUpdateDestroyView(RetrieveUpdateDestroyAPIView):
    serializer_class=BudgetSerializer
    lookup_field='id'
    
    def get_queryset(self):
        user=self.request.user
        queryset=Budget.objects.filter(user=user)
        return queryset
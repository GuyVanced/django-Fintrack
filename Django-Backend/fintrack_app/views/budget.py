# fintrack_app/views/budget.py

from rest_framework import generics
from fintrack_app.models import Budget
from fintrack_app.serializers.budget import BudgetSerializer


class BudgetListCreateView(generics.ListCreateAPIView):
    serializer_class = BudgetSerializer

    def get_queryset(self):
        # only this user’s budgets
        return Budget.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        # NOTE: our serializer.create() pulls `user` from request.user
        # so we don’t pass user= here—just save with the context.
        serializer.save()


class BudgetRetrieveUpdateDestroyView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = BudgetSerializer
    lookup_field = 'id'

    def get_queryset(self):
        return Budget.objects.filter(user=self.request.user)

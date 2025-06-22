from fintrack_app.serializers.transaction import TransactionSerializer
from fintrack_app.models import Transaction, UserCategory
from rest_framework.generics import ListCreateAPIView,RetrieveUpdateDestroyAPIView

from ..services.budget_service import BudgetService

from django.db import transaction as db_transaction

class TransactionListCreateView(ListCreateAPIView):
    serializer_class = TransactionSerializer

    def get_queryset(self):
        user = self.request.user
        if user.is_authenticated:
            return Transaction.objects.filter(user=user).order_by('-date')
        return Transaction.objects.none()

    def perform_create(self, serializer):
        tx = serializer.save()
    
        


class TransactionRetrieveUpdateDestroyView(RetrieveUpdateDestroyAPIView):
    serializer_class = TransactionSerializer
    lookup_field = 'id'

    def get_queryset(self):
        user = self.request.user
        if user.is_authenticated:
            return Transaction.objects.filter(user=user).order_by('-date')
        return Transaction.objects.none()

    @db_transaction.atomic
    def perform_update(self, serializer):
        # Persist the updated transaction (this calls your serializer.update())
        tx = serializer.save()
        
        

    @db_transaction.atomic
    def perform_destroy(self, instance):
        user = self.request.user
        account = instance.account
        amount  = instance.amount
        # instance.category is now a UserCategory FK
        user_cat = instance.category

        # Reverse the original impact on balance
        if instance.transaction_type == Transaction.TransactionType.INCOME:
            account.balance -= amount
        else:
            account.balance += amount
        account.save()

        # 2) Fetch and roll back the per-user category total

        user_cat = UserCategory.objects.get(
            user=user,
            master_category=instance.category
        )
        user_cat.total_amount -= amount
        user_cat.save(update_fields=['total_amount'])

        instance.delete()





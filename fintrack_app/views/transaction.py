from fintrack_app.serializers.transaction import TransactionSerializer
from fintrack_app.models import Transaction
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
        account = instance.account
        amount  = instance.amount
        # instance.category is now a UserCategory FK
        user_cat = instance.category

        # Reverse the original impact on balance
        if instance.transaction_type == Transaction.transaction_type.MYINCOME:
            account.balance -= amount
        else:
            account.balance += amount
        account.save()

        # Reverse it on the category total
        user_cat.total_amount -= amount
        user_cat.save()

        instance.delete()





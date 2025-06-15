from fintrack_app.serializers.transaction import TransactionSerializer
from fintrack_app.models import Transaction
from rest_framework.generics import ListCreateAPIView,RetrieveUpdateDestroyAPIView

from django.db import transaction as db_transaction

class TransactionListCreateView(ListCreateAPIView):
    serializer_class=TransactionSerializer
    # queryset=Transaction.objects.all()
    def get_queryset(self):
        user=self.request.user
        if user.is_authenticated:
            queryset=Transaction.objects.filter(user=user).order_by('-date')
            return queryset
        return Transaction.objects.none()

    def perform_create(self,serializer):
        user=self.request.user
        serializer.save(user=user)


        
class TransactionRetrieveUpdateDestroyView(RetrieveUpdateDestroyAPIView):
    serializer_class = TransactionSerializer
    lookup_field = 'id'
    
    def get_queryset(self):
        user=self.request.user
        if user.is_authenticated:
            queryset=Transaction.objects.filter(user=user).order_by('-date')
            return queryset
        return Transaction.objects.none()


    @db_transaction.atomic
    def perform_destroy(self, instance):
        account = instance.account
        amount = instance.amount
        category=instance.category

        # Reverse the effect on account balance
        if instance.transaction_type == Transaction.Transaction_type.MYINCOME:
            account.balance -= amount
        elif instance.transaction_type == Transaction.Transaction_type.MYEXPENSE:
            account.balance += amount
   
        if amount:
            category.total_amount-=amount

        account.save()
        category.save()

        instance.delete()



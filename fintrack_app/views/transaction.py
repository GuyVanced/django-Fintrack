from fintrack_app.serializers.transaction import TransactionSerializer
from fintrack_app.models import Transaction,CategoryTotal
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


# class TransactionRetrieveUpdateDestroyView(RetrieveUpdateDestroyAPIView):
#     serializer_class=TransactionSerializer
#     lookup_field='id'
#     queryset=Transaction.objects.all()

#     def perform_destroy(self, instance):
#         account=instance.account
#         amount=instance.amount

#         ##Reverse effect
#         if instance.transaction_type==Transaction.Transaction_type.MYINCOME:
#             account.balance-=amount
#         elif instance.transaction_type==Transaction.Transaction_type.MYEXPENSE:
#             account.balance+=amount

#         account.save()
#         instance.delete()        



        
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

        # Reverse the effect on account balance
        if instance.transaction_type == Transaction.Transaction_type.MYINCOME:
            account.balance -= amount
        elif instance.transaction_type == Transaction.Transaction_type.MYEXPENSE:
            account.balance += amount

        account.save()

        # Update CategoryTotal
        try:
            category_total = CategoryTotal.objects.get(
                user=instance.user,
                category=instance.category,
                account=account,
                transaction_type=instance.transaction_type
            )
            category_total.total_amount -= amount
            if category_total.total_amount < 0:
                category_total.total_amount = 0
            category_total.save()
        except CategoryTotal.DoesNotExist:
            pass  # Ignore if total record doesn't exist

        # Now delete the transaction
        instance.delete()
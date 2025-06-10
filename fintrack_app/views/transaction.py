from fintrack_app.serializers.transaction import TransactionSerializer
from fintrack_app.models import Transaction
from rest_framework.generics import ListCreateAPIView,RetrieveUpdateDestroyAPIView

class TransactionListCreateView(ListCreateAPIView):
    serializer_class=TransactionSerializer
    queryset=Transaction.objects.all()


class TransactionRetrieveUpdateDestroyView(RetrieveUpdateDestroyAPIView):
    serializer_class=TransactionSerializer
    lookup_field='id'
    queryset=Transaction.objects.all()

    def perform_destroy(self, instance):
        account=instance.account
        amount=instance.amount

        ##Reverse effect
        if instance.transaction_type==Transaction.Transaction_type.MYINCOME:
            account.balance-=amount
        elif instance.transaction_type==Transaction.Transaction_type.MYEXPENSE:
            account.balance+=amount

        account.save()
        instance.delete()        



        

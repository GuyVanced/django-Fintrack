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

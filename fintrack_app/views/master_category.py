# fintrack_app/views/master_category.py

from rest_framework import generics
from fintrack_app.models.master_category import MasterCategory
from fintrack_app.serializers.master_category import MasterCategorySerializer

class MasterCategoryListCreateView(generics.ListCreateAPIView):
    queryset = MasterCategory.objects.all()
    serializer_class = MasterCategorySerializer

    def get_queryset(self):
        qs = super().get_queryset()
        tx_type = self.request.query_params.get('transaction_type')

        # Option A: use the .values list provided by TextChoices
        if tx_type in MasterCategory.TransactionType.values:
            qs = qs.filter(transaction_type=tx_type)

        return qs

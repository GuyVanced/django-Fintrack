# fintrack_app/views/category.py

from rest_framework.generics import ListCreateAPIView, RetrieveUpdateDestroyAPIView
from fintrack_app.models import UserCategory
from fintrack_app.models.master_category import MasterCategory
from fintrack_app.serializers.category import UserCategorySerializer


class CategoryListCreateView(ListCreateAPIView):
    serializer_class = UserCategorySerializer

    def get_queryset(self):
        user = self.request.user
        qs = UserCategory.objects.filter(user=user)

        tx = self.request.query_params.get('transaction_type')
        # TransactionType lives on MasterCategory, not UserCategory
        if tx in MasterCategory.TransactionType.values:
            # filter through the FK
            qs = qs.filter(master_category__transaction_type=tx)

        return qs

    def perform_create(self, serializer):
        # total_amount is defaulted to 0 on create
        serializer.save(user=self.request.user, total_amount=0)


class CategoryRetrieveUpdateDestroyAPIView(RetrieveUpdateDestroyAPIView):
    serializer_class = UserCategorySerializer
    lookup_field = 'id'

    def get_queryset(self):
        return UserCategory.objects.filter(user=self.request.user)

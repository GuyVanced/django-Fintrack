# fintrack_app/views/category.py
from rest_framework.generics import ListCreateAPIView, RetrieveUpdateDestroyAPIView
from fintrack_app.models import Category
from fintrack_app.serializers import CategorySerializer

class CategoryListCreateView(ListCreateAPIView):
    serializer_class = CategorySerializer

    def get_queryset(self):
        qs = Category.objects.filter(user=self.request.user)
        tx = self.request.query_params.get('transaction_type')
        if tx in Category.TransactionType.values:
            qs = qs.filter(transaction_type=tx)
        return qs

    def perform_create(self, serializer):
        serializer.save(user=self.request.user, total_amount=0)


class CategoryRetrieveUpdateDestroyAPIView(RetrieveUpdateDestroyAPIView):
    serializer_class = CategorySerializer
    lookup_field = 'id'

    def get_queryset(self):
        return Category.objects.filter(user=self.request.user)

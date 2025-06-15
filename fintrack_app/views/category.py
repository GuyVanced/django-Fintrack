from fintrack_app.serializers import CategorySerializer
from rest_framework.generics import ListCreateAPIView,RetrieveUpdateDestroyAPIView
from fintrack_app.models import Category

class CategoryListCreateView(ListCreateAPIView):
    serializer_class=CategorySerializer

    def get_queryset(self):
        user=self.request.user
        queryset=Category.objects.filter(user=user)
        return queryset

    def perform_create(self,serializer):
        user=self.request.user
        serializer.save(user=user)    


class CategoryRetrieveUpdateDestroyAPIView(RetrieveUpdateDestroyAPIView):
    serializer_class=CategorySerializer
    lookup_field='id'

    def get_queryset(self):
        return Category.objects.filter(user=self.request.user)


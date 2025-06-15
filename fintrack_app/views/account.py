from fintrack_app.models import Account
from fintrack_app.serializers.account import AccountSerializer
from rest_framework.generics import ListCreateAPIView,CreateAPIView,RetrieveAPIView,UpdateAPIView,DestroyAPIView,RetrieveUpdateDestroyAPIView

class AccountListCreateView(ListCreateAPIView):
    serializer_class=AccountSerializer
    
    
    def get_queryset(self):
        user=self.request.user
        queryset=Account.objects.filter(user=user)
        return queryset
    def perform_create(self,serializer):
        user=self.request.user
        serializer.save(user=user)

        


class AccountRetrieveUpdateDestroyView(RetrieveUpdateDestroyAPIView):
    serializer_class=AccountSerializer
    lookup_field='id'

    def get_queryset(self):
        user=self.request.user
        queryset=Account.objects.filter(user=user)
        return queryset
  



 



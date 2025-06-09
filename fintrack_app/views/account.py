from fintrack_app.models import Account
from fintrack_app.serializers.account import AccountSerializer
from rest_framework.generics import ListCreateAPIView,CreateAPIView,RetrieveAPIView,UpdateAPIView,DestroyAPIView,RetrieveUpdateDestroyAPIView

class AccountListCreateView(ListCreateAPIView):
    serializer_class=AccountSerializer
    queryset=Account.objects.all()

    # def perform_create(self,serializer):
    #     # user=self.request.user
    #     serializer.save()


# class AccountListView(ListAPIView):
    
#     serializer_class=AccountSerializer

#     def get_queryset(self):
#         user=self.request.user
#         if user.is_authenticated:
#             queryset=Account.objects.filter(user=user)
#             return queryset
#         return Account.objects.none()
    
# class AccountListView(ListAPIView):
    
#     serializer_class=AccountSerializer

#     def get_queryset(self):
#         # user=self.request.user
#         queryset=Account.objects.all()
#         return queryset
        


class AccountRetrieveUpdateDestroyView(RetrieveUpdateDestroyAPIView):
    serializer_class=AccountSerializer
    lookup_field='id'

    def get_queryset(self):
          
        queryset=Account.objects.all()
        return queryset
  







# class AccountRetrieveView(RetrieveAPIView):
#     serializer_class=AccountSerializer
#     lookup_field='id'

#     def get_queryset(self):
#         user=self.request.user
#         if user.is_authenticated:
#             queryset=Account.objects.filter(user=user)
#             return queryset

# class AccountUpdateView(UpdateAPIView):  
#     serializer_class=AccountSerializer
#     lookup_field='id'

#     def get_queryset(self):
#         user=self.request.user
#         if user.is_authenticated:
#             queryset=Account.objects.filter(user=user)
#             return queryset 
#         return Account.objects.none()  
         
# class AccountDeleteView(DestroyAPIView):
#     serializer_class=AccountSerializer
#     lookup_field='id'

#     def get_queryset(self):
#         user=self.request.user
#         if user.is_authenticated:
#             queryset=Account.objects.filter(user=user)
#             return queryset 
#         return Account.objects.none()         



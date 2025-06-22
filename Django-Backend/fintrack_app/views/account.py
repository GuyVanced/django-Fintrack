from rest_framework import generics
from rest_framework.permissions import IsAuthenticated
from fintrack_app.models.account import Account
from fintrack_app.serializers.account import AccountSerializer


class AccountListCreateView(generics.ListCreateAPIView):
    """
    GET  /api/accounts/        -> list accounts for current user
    POST /api/accounts/        -> create a new account for current user
    """
    serializer_class = AccountSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        # Only return accounts owned by the authenticated user
        return Account.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        # Automatically set user on creation
        serializer.save(user=self.request.user)


class AccountRetrieveUpdateDestroyView(generics.RetrieveUpdateDestroyAPIView):
    """
    GET    /api/accounts/{id}/    -> retrieve a single account
    PUT    /api/accounts/{id}/    -> update an account
    PATCH  /api/accounts/{id}/    -> partial update
    DELETE /api/accounts/{id}/    -> delete an account
    """
    serializer_class = AccountSerializer
    permission_classes = [IsAuthenticated]
    lookup_field = 'id'

    def get_queryset(self):
        # Ensure users can only access their own accounts
        return Account.objects.filter(user=self.request.user)

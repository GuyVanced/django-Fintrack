from fintrack_app.serializers.transaction import TransactionSerializer
from fintrack_app.models import Transaction, UserCategory
from rest_framework.generics import ListCreateAPIView,RetrieveUpdateDestroyAPIView
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db.models import Sum
from datetime import datetime

from ..services.budget_service import BudgetService

from django.db import transaction as db_transaction

class TransactionListCreateView(ListCreateAPIView):
    serializer_class = TransactionSerializer

    def get_queryset(self):
        user = self.request.user
        if not user.is_authenticated:
            return Transaction.objects.none()
        
        queryset = Transaction.objects.filter(user=user)
        
        # Handle date filtering
        date_gte = self.request.query_params.get('date__gte')
        date_lte = self.request.query_params.get('date__lte')
        
        if date_gte:
            queryset = queryset.filter(date__gte=date_gte)
        if date_lte:
            queryset = queryset.filter(date__lte=date_lte)
            
        # Handle transaction type filtering
        transaction_type = self.request.query_params.get('transaction_type')
        if transaction_type:
            queryset = queryset.filter(transaction_type=transaction_type)
            
        # Handle account filtering
        account_id = self.request.query_params.get('account')
        if account_id:
            queryset = queryset.filter(account_id=account_id)
            
        # Handle category filtering
        category_id = self.request.query_params.get('category')
        if category_id:
            queryset = queryset.filter(category_id=category_id)
            
        # Handle amount filtering
        amount_gte = self.request.query_params.get('amount__gte')
        amount_lte = self.request.query_params.get('amount__lte')
        
        if amount_gte:
            queryset = queryset.filter(amount__gte=amount_gte)
        if amount_lte:
            queryset = queryset.filter(amount__lte=amount_lte)
            
        # Handle search in description
        search = self.request.query_params.get('search')
        if search:
            queryset = queryset.filter(description__icontains=search)
            
        # Handle recurring transactions filter
        is_recurring = self.request.query_params.get('isRecurring')
        if is_recurring is not None:
            is_recurring_bool = is_recurring.lower() == 'true'
            queryset = queryset.filter(isRecurring=is_recurring_bool)
        
        return queryset.order_by('-date')

    def perform_create(self, serializer):
        tx = serializer.save()


class FinancialSummaryView(APIView):
    """
    GET /api/financial-summary/
    Query params: start_date, end_date, account (optional)
    """
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        user = request.user
        
        # Get date filters
        start_date = request.query_params.get('start_date')
        end_date = request.query_params.get('end_date')
        account_id = request.query_params.get('account')
        
        # Build base queryset
        queryset = Transaction.objects.filter(user=user)
        
        # Apply date filters
        if start_date:
            queryset = queryset.filter(date__gte=start_date)
        if end_date:
            queryset = queryset.filter(date__lte=end_date)
        if account_id:
            queryset = queryset.filter(account_id=account_id)
        
        # Calculate totals
        income_total = queryset.filter(
            transaction_type=Transaction.TransactionType.INCOME
        ).aggregate(total=Sum('amount'))['total'] or 0
        
        expense_total = queryset.filter(
            transaction_type=Transaction.TransactionType.EXPENSE
        ).aggregate(total=Sum('amount'))['total'] or 0
        
        net_income = float(income_total - expense_total)
        
        # Get account balances
        from fintrack_app.models.account import Account
        accounts = Account.objects.filter(user=user)
        account_balances = {
            account.name: float(account.balance) 
            for account in accounts
        }
        
        # Get category breakdown
        category_breakdown = {}
        for transaction in queryset:
            category_name = transaction.category.name
            amount = float(transaction.amount)
            if category_name in category_breakdown:
                category_breakdown[category_name] += amount
            else:
                category_breakdown[category_name] = amount
        
        return Response({
            'total_income': float(income_total),
            'total_expenses': float(expense_total),
            'net_income': net_income,
            'account_balances': account_balances,
            'category_breakdown': category_breakdown,
        })



class TransactionRetrieveUpdateDestroyView(RetrieveUpdateDestroyAPIView):
    serializer_class = TransactionSerializer
    lookup_field = 'id'

    def get_queryset(self):
        user = self.request.user
        if user.is_authenticated:
            return Transaction.objects.filter(user=user).order_by('-date')
        return Transaction.objects.none()

    @db_transaction.atomic
    def perform_update(self, serializer):
        # Persist the updated transaction (this calls your serializer.update())
        tx = serializer.save()
        
        

    @db_transaction.atomic
    def perform_destroy(self, instance):
        user = self.request.user
        account = instance.account
        amount  = instance.amount
        # instance.category is now a UserCategory FK
        user_cat = instance.category

        # Reverse the original impact on balance
        if instance.transaction_type == Transaction.TransactionType.INCOME:
            account.balance -= amount
        else:
            account.balance += amount
        account.save()

        # 2) Fetch and roll back the per-user category total

        user_cat = UserCategory.objects.get(
            user=user,
            master_category=instance.category
        )
        user_cat.total_amount -= amount
        user_cat.save(update_fields=['total_amount'])

        instance.delete()





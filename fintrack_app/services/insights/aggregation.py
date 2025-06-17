from django.db.models import Sum
from datetime import date
from dateutil.relativedelta import relativedelta

from fintrack_app.models import Transaction

def get_date_range(year: int, month: int):
    start = date(year, month, 1)
    end   = start + relativedelta(months=1)
    return start, end

def fetch_aggregates(user, start: date, end: date) -> dict:
    """
    Returns sums and category breakdowns for income and expenses.
    """
    qs = Transaction.objects.filter(
        user=user,
        date__gte=start,
        date__lt=end
    )
    incomes = qs.filter(transaction_type=Transaction.Transaction_type.MYINCOME)
    expenses = qs.filter(transaction_type=Transaction.Transaction_type.MYEXPENSE)

    total_income  = incomes.aggregate(t=Sum('amount'))['t'] or 0
    total_expense = expenses.aggregate(t=Sum('amount'))['t'] or 0

    income_breakdown = {
        row['category__category']: float(row['amt'])
        for row in incomes
            .values('category__category')
            .annotate(amt=Sum('amount'))
    }
    expense_breakdown = {
        row['category__category']: float(row['amt'])
        for row in expenses
            .values('category__category')
            .annotate(amt=Sum('amount'))
    }

    return {
        'total_income': float(total_income),
        'income_breakdown': income_breakdown,
        'total_expense': float(total_expense),
        'expense_breakdown': expense_breakdown,
        'net': float(total_income - total_expense),
    }

def compute_comparisons(curr: dict, prev: dict) -> dict:
    return {
        'delta_income':  curr['total_income']  - prev.get('total_income',  0),
        'delta_expense': curr['total_expense'] - prev.get('total_expense', 0),
        'delta_net':     curr['net']           - prev.get('net',           0),
    }

from celery import shared_task
from datetime import timedelta
from django.utils import timezone
from django.db.models import Q  # Needed for OR queries
from fintrack_app.models.budget import Budget  # Import your model

@shared_task(name='reset_monthly_budgets')
def reset_monthly_budgets():
    # from fintrack_app.models.budget import Budget  # Import your model

    now = timezone.now()  # Get the current time (timezone-aware)
    reset_count = 0

    
    print("🚀 Task Started — reset_monthly_budgets")
    print(f"Now: {now}")
    print(f"Starting budget reset at {now}")

    try:
        # Find budgets where last_reset is null or was reset more than 1 minute ago
        budgets = Budget.objects.filter(
            Q(last_reset__isnull=True) | Q(last_reset__lte=now - timedelta(minutes=1))
        )
#
        # budgets=Budget.objects.all()
        print(f"Budgets found: {budgets.count()}")
        # Loop through each matching budget
        for budget in budgets:
            budget.budget_amount = 0
            budget.is_exceed=False
            budget.last_reset = now
            budget.save(update_fields=['budget_amount', 'last_reset'])
            reset_count += 1
            print(f"Reset budget ID {budget.id} at {now}")

        return f"Successfully reset {reset_count} budgets."
    
    except Exception as e:
        print(f"Error resetting budgets: {str(e)}")
        raise  # Re-raise the error for Celery to report it

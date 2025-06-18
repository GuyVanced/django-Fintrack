from celery import shared_task
# from fintrack_app.models.budget import Budget
from datetime import datetime,timedelta

@shared_task

def reset_monthly_budgets():
    from fintrack_app.models.budget import Budget  # Import models **inside** task
    print("Resetting budgets ")
    now=datetime.now()
    reset_count=0

  
    budgets=Budget.objects.all()
    for budget in budgets:
        if budget.last_reset is None or (now-budget.last_reset)>=timedelta(minutes=1):
            budget.budget_amount=0
            budget.last_reset=now
            budget.save(update_fields=['budget_amount','last_reset'])
            reset_count+=1
            print(f"Reset budget ID {budget.id}")

    return f"Reset {reset_count} budgets."    



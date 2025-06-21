# fintrack_app/services/budget_service.py

from fintrack_app.models import Budget, UserCategory
from fintrack_app.services.email_service import EmailService

class BudgetService:
    @staticmethod
    def check_and_notify_budget(user_category: UserCategory):
        # 1) Safety check
        if not isinstance(user_category, UserCategory):
            raise TypeError(
                f"BudgetService.check_and_notify_budget() expected a "
                f"UserCategory instance, got {type(user_category).__name__!r}"
            )

        # 2) Look up the Budget tied to this user and this specific UserCategory
        budget = Budget.objects.filter(
            user=user_category.user,
            category=user_category
        ).first()

        if not budget:
            # no budget set for this category → nothing to do
            return

        # 3) Compare totals and toggle the flag / send alert
        if user_category.total_amount > budget.budget_amount:
            if not budget.is_exceed:
                budget.is_exceed = True
                budget.save(update_fields=['is_exceed'])
                EmailService.send_budget_alert(
                    user=user_category.user,
                    # If EmailService wants the name of the master category:
                    category=user_category,
                    total=user_category.total_amount,
                    budget_limit=budget.budget_amount
                )
        else:
            if budget.is_exceed:
                budget.is_exceed = False
                budget.save(update_fields=['is_exceed'])

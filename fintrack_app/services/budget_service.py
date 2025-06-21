from fintrack_app.models import Budget, UserCategory
from fintrack_app.services.email_service import EmailService

class BudgetService:
    @staticmethod
    def check_and_notify_budget(category):
        # category = Category.objects.first()
        budget=Budget.objects.filter(user=category.user, category=category).first()



        if budget:
            if category.total_amount> budget.budget_amount:
                # if not budget.is_exceed: #avoid budget emails
                    budget.is_exceed=True
                    budget.save()
                    EmailService.send_budget_alert(
                        user=category.user,
                        category=category,
                        total=category.total_amount,
                        budget_limit=budget.budget_amount

                    )
            else:
                if budget.is_exceed: #reset Flag if now its under budget
                    budget.is_exceed=False
                    budget.save()        
from django.db import models
# from .user import User
from django.contrib.auth.models import User
from .category import Category
from django.core.exceptions import ValidationError
from .account import Account


class Budget(models.Model):
    id = models.AutoField(primary_key=True)
    user = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name='budgets')
    budget_amount = models.DecimalField(max_digits=20, decimal_places=2)
    # type=models.CharField(max_length=50)
    category=models.ForeignKey(Category,on_delete=models.CASCADE,related_name='budgets')
    is_exceed=models.BooleanField(default=False)
    createdAt = models.DateTimeField(auto_now=True)

    

    

    def __str__(self):
        return self.transaction.category

    class Meta:
        db_table = 'budget'
        ordering = ['-createdAt']

    def clean(self):
        super().clean()
        errors = {}

        if self.user.transactions.filter(id=self.transaction.id).count() == 0:
            # spelling of errors['transaction'] here transaciton spelling should exactly match the field name in the model i.e transaction
            errors['transaction'] = 'Transaction does not belong to the user.'
        if errors:
            raise ValidationError(errors)

    def save(self, *args, **kwargs):
        self.full_clean()
        super().save(*args, **kwargs)





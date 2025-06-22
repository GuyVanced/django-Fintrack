from django.db import models
from django.contrib.auth.models import User
from django.core.exceptions import ValidationError

from .category import UserCategory
from .account import Account


class Budget(models.Model):
    id = models.AutoField(primary_key=True)
    user = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name='budgets'
    )
    category = models.ForeignKey(
        UserCategory, on_delete=models.CASCADE, related_name='budgets'
    )
    budget_amount = models.DecimalField(max_digits=20, decimal_places=2)
    is_exceed = models.BooleanField(default=False)
    createdAt = models.DateTimeField(auto_now=True)
    last_reset = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        # show the master-category name, not `.category`
        return f"{self.category.master_category.name} budget for {self.user.username}"

    class Meta:
        db_table = 'budget'
        ordering = ['-createdAt']
        constraints = [
            models.UniqueConstraint(
                fields=['user', 'category'],
                name='unique_budget_per_user_category'
            )
        ]

    def clean(self):
        super().clean()
        # Option A: compare the FK directly
        if self.category.user != self.user:
            raise ValidationError({
                'category': 'Category does not belong to the user.'
            })

        # --- OR, if you prefer using the reverse relation ---
        # if not self.user.user_categories.filter(pk=self.category.pk).exists():
        #     raise ValidationError({
        #         'category': 'Category does not belong to the user.'
        #     })

    def save(self, *args, **kwargs):
        self.full_clean()
        super().save(*args, **kwargs)

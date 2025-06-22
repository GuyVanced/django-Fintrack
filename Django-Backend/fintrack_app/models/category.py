# fintrack_app/models/category.py  # renamed to user-category model
from django.db import models
from django.contrib.auth.models import User
from .master_category import MasterCategory

class UserCategory(models.Model):
    user = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name='user_categories'
    )
    master_category = models.ForeignKey(
        MasterCategory, on_delete=models.PROTECT, related_name='user_categories'
    )
    total_amount = models.DecimalField(max_digits=20, decimal_places=2, default=0)

    class Meta:
        db_table = 'category'
        unique_together = ('user','master_category')
        ordering = ['master_category__transaction_type','master_category__name']

    def __str__(self):
        return self.master_category.name
# models.py
from django.db import models
from django.contrib.auth.models import User
from .account import Account



class CategoryTotal(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    category = models.CharField(max_length=100)
    account = models.ForeignKey(Account, on_delete=models.CASCADE)
    transaction_type = models.CharField(max_length=10)  # 'Ex' or 'In'
    total_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0)

    class Meta:
        # unique_together = ['user', 'category', 'account', 'transaction_type']
        pass

    def __str__(self):
        return self.category
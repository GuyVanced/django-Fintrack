# fintrack_app/models/category.py
from django.db import models
from django.contrib.auth.models import User

class Category(models.Model):
    class TransactionType(models.TextChoices):
        INCOME  = 'INCOME',  'Income'
        EXPENSE = 'EXPENSE', 'Expense'

    class NameChoices(models.TextChoices):
        # — Income —
        SALARY        = 'Salary',     'Salary'
        INVESTMENTS   = 'Investments','Investments'
        FREELANCE     = 'Freelance',  'Freelance'
        OTHERS        = 'Others',     'Others'
        # — Expense —
        FOOD          = 'Food',          'Food'
        HOUSING       = 'Housing',       'Housing'
        GROCERIES     = 'Groceries',     'Groceries'
        ELECTRONICS   = 'Electronics',   'Electronics'
        TRANSPORTATION= 'Transportation','Transportation'
        DINING        = 'Dining',        'Dining'
        HEALTHCARE    = 'Healthcare',    'Healthcare'
        SHOPPING      = 'Shopping',      'Shopping'
        ENTERTAINMENT = 'Entertainment', 'Entertainment'
        UTILITIES     = 'Utilities',     'Utilities'
        OTHER         = 'Other',         'Other'

    user             = models.ForeignKey(User, on_delete=models.CASCADE, related_name='categories')
    transaction_type = models.CharField(
        max_length=7,
        choices=TransactionType.choices,
        default=TransactionType.INCOME,   # ← here
    )

    category         = models.CharField(max_length=20, choices=NameChoices.choices)
    total_amount     = models.BigIntegerField(default=0)

    class Meta:
        unique_together = ('user','transaction_type','category')
        ordering        = ['transaction_type','category']
        db_table        = 'category'

    def __str__(self):
        return f"{self.category} ({self.transaction_type.lower()})"

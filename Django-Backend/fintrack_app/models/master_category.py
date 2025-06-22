from django.db import models

class MasterCategory(models.Model):
    class TransactionType(models.TextChoices):
        INCOME = 'In', 'Income'
        EXPENSE = 'Ex', 'Expense'

    class NameChoices(models.TextChoices):
        SALARY        = 'Salary',      'Salary'
        INVESTMENTS   = 'Investments', 'Investments'
        FREELANCE     = 'Freelance',   'Freelance'
        OTHERS        = 'Others',      'Others'
        FOOD          = 'Food',        'Food'
        HOUSING       = 'Housing',     'Housing'
        GROCERIES     = 'Groceries',   'Groceries'
        ELECTRONICS   = 'Electronics', 'Electronics'
        TRANSPORTATION= 'Transportation','Transportation'
        DINING        = 'Dining',      'Dining'
        HEALTHCARE    = 'Healthcare',  'Healthcare'
        SHOPPING      = 'Shopping',    'Shopping'
        ENTERTAINMENT = 'Entertainment','Entertainment'
        UTILITIES     = 'Utilities',   'Utilities'
        OTHER         = 'Other',       'Other'

    transaction_type = models.CharField(
        max_length=2,
        choices=TransactionType.choices,
        default=TransactionType.EXPENSE,
    )
    name = models.CharField(
        max_length=20,
        choices=NameChoices.choices,
        unique=True,
    )

    class Meta:
        db_table = 'master_category'
        unique_together = ('transaction_type','name')
        ordering = ['transaction_type','name']

    def __str__(self):
        return self.name
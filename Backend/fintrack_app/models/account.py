# fintrack_app/models/account.py

from django.db import models
from django.contrib.auth.models import User

class Account(models.Model):
    class AccountType(models.TextChoices):
        CHECKING   = 'CK', 'Checking'
        SAVINGS    = 'SV', 'Savings'
        CREDIT     = 'CR', 'Credit Card'
        CASH       = 'CA', 'Cash'
        INVESTMENT = 'IN', 'Investment'

    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='accounts'
    )
    account_type = models.CharField(
        max_length=2,
        choices=AccountType.choices,
        help_text="Select the type of account."
    )
    name = models.CharField(
        max_length=100,
        help_text="A friendly name for this account (e.g. “Main Checking”)."
    )
    
    account_number = models.CharField(
        max_length=50,
        blank=True,
        null=True,
        help_text="Optional account number (if applicable)."
    )
    institution = models.CharField(
        max_length=100,
        blank=True,
        null=True,
        help_text="Optional financial institution name."
    )

    balance = models.DecimalField(
        max_digits=20,
        decimal_places=2,
        default=0,
        help_text="Current balance of the account."
    )
    updated_at = models.DateTimeField(auto_now=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'account'
        ordering = ['-created_at']
        unique_together = [['user', 'name']]

    def __str__(self):
        return self.name

# fintrack_app/models/transaction.py

from django.db import models
from django.contrib.auth.models import User
from django.core.exceptions import ValidationError
from .account import Account
from .category import Category as UserCategory  # per-user Category model

class Transaction(models.Model):
    class Transaction_type(models.TextChoices):
        MYINCOME  = 'In', 'INCOME'
        MYEXPENSE = 'Ex', 'EXPENSE'

    user             = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name='transactions'
    )
    transaction_type = models.CharField(
        max_length=2,
        choices=Transaction_type.choices,
        default=Transaction_type.MYEXPENSE,
    )
    account = models.ForeignKey(
        Account, on_delete=models.CASCADE, related_name='transactions'
    )
    category = models.CharField(
        max_length=20,
        choices=UserCategory.NameChoices.choices
    )
    amount            = models.DecimalField(max_digits=20, decimal_places=2)
    description       = models.CharField(max_length=255, blank=True)
    date              = models.DateTimeField()
    receiptPath       = models.CharField(max_length=255, blank=True)
    isRecurring       = models.BooleanField(default=False)
    recurringInterval = models.CharField(max_length=50, blank=True)
    nextRecurringDate = models.DateTimeField(null=True, blank=True)
    lastProcessedDate = models.DateTimeField(null=True, blank=True)
    createdAt         = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'transaction'
        ordering = ['-date']

    def clean(self):
        super().clean()
        errs = {}
        if not self.user.accounts.filter(id=self.account_id).exists():
            errs['account'] = 'Account does not belong to the user.'
        if self.isRecurring and not (self.recurringInterval and self.nextRecurringDate):
            errs['recurringInterval'] = 'Required for recurring transactions'
            errs['nextRecurringDate'] = 'Required for recurring transactions'
        if errs:
            raise ValidationError(errs)

    def save(self, *args, **kwargs):
        # Always run clean before saving
        self.full_clean()
        super().save(*args, **kwargs)
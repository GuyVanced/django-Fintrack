from django.db import models
from django.contrib.auth.models import User
from django.core.exceptions import ValidationError
from .account import Account
from .master_category import MasterCategory  # master list
from .category import UserCategory


from rest_framework import serializers
from fintrack_app.models.master_category import MasterCategory

class Transaction(models.Model):
    class TransactionType(models.TextChoices):
        INCOME  = 'In', 'INCOME'
        EXPENSE = 'Ex', 'EXPENSE'

    user = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name='transactions'
    )
    transaction_type = models.CharField(
        max_length=2,
        choices=TransactionType.choices,
        default=TransactionType.EXPENSE,
    )
    account = models.ForeignKey(
        Account, on_delete=models.CASCADE, related_name='transactions'
    )
    category = models.ForeignKey(
        MasterCategory, on_delete=models.PROTECT, related_name='transactions'
    )
    amount = models.DecimalField(max_digits=20, decimal_places=2)
    description = models.CharField(max_length=255, blank=True)
    date = models.DateTimeField()
    receiptPath = models.CharField(max_length=255, blank=True)
    isRecurring = models.BooleanField(default=False)
    recurringInterval = models.CharField(max_length=50, blank=True)
    nextRecurringDate = models.DateTimeField(null=True, blank=True)
    lastProcessedDate = models.DateTimeField(null=True, blank=True)
    createdAt = models.DateTimeField(auto_now_add=True)

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
        self.full_clean()
        super().save(*args, **kwargs)



class MasterCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = MasterCategory
        fields = ['id', 'transaction_type', 'name']
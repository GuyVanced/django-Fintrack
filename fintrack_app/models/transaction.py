from django.db import models
from django.contrib.auth.models import User
from .account import Account
from django.core.exceptions import ValidationError


class Transaction(models.Model):
    class Transaction_type(models.TextChoices):
        MYINCOME = 'In', 'INCOME'
        MYEXPENSE = 'Ex', "EXPENSE"

    id = models.AutoField(primary_key=True)
    user = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name='transactions')
    transaction_type = models.CharField(
        choices=Transaction_type.choices, default=Transaction_type.MYEXPENSE)
    account = models.ForeignKey(
        Account, on_delete=models.CASCADE, related_name='transactions')
    amount = models.DecimalField(max_digits=20, decimal_places=2)
    description = models.CharField(max_length=255, blank=True)
    # date = models.DateTimeField(auto_now=True) ##same like updated_at saves latest time 
    date = models.DateTimeField()
    category = models.CharField(max_length=50,default=None)
    receiptUrl = models.URLField(blank=True)
    isRecurring = models.BooleanField(default=False)
    recurringInterval = models.CharField(max_length=50, blank=True)
    nextRecurringDate = models.DateTimeField(blank=True, null=True)
    lastProcessedDate = models.DateTimeField(blank=True, null=True)
    # status=models.TimeField(auto_now=True)
    createdAt = models.DateTimeField(auto_now_add=True)
    # updatedAt = models.DateTimeField(auto_now=True)
    

    def clean(self):
        super().clean()
        errors = {}

        if self.user.accounts.filter(id=self.account.id).count() == 0:
            errors['account'] = 'Account does not belong to the user.'
        if self.isRecurring:
            if not self.recurringInterval and not self.nextRecurringDate:
                errors['recurringInterval'] = 'recurringInterval is required for recurring transactions'
                errors['nextRecurringDate'] = 'nextRecurringDate is required for recurring transactions'    
                
    

        if errors:
            raise ValidationError(errors)

    def save(self, *args, **kwargs):
        self.full_clean()
        super().save(*args, **kwargs)

    def __str__(self):
        return self.category if self.category else f"{self.transaction_type}{self.id}"

    class Meta:
        db_table = 'transaction'
        ordering = ['-date']
        # unique_together = ('user', 'account', 'category')
        # unique_together = ( 'account', 'category')

from django.db import models
from django.contrib.auth.models import User
# from .user import User
from django.core.exceptions import ValidationError


class Account_type(models.Model):
    account_type = models.CharField(max_length=50, unique=True)
    isWallet = models.BooleanField(default=False)

    class Meta:
        abstract = True


class Account(Account_type, models.Model):

    id = models.AutoField(primary_key=True)
    isDefault = models.BooleanField(default=False)
    user = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name='accounts',default=1)
    name = models.CharField(max_length=100)
    account_number = models.BigIntegerField(unique=True, null=True, blank=True)
    wallet_number = models.BigIntegerField(unique=True, null=True, blank=True)

    balance = models.DecimalField(
        max_digits=20, decimal_places=2, default=0.00)
    createdAt = models.DateTimeField(auto_now=True)
    updatedAt = models.DateTimeField(auto_now_add=True)
    description = None

    def __str__(self):
        return self.name

    class Meta:
        db_table = 'account'
        ordering = ['-createdAt']

    def clean(self):
        super().clean()
        errors = {}

        if self.account_type is None:
            errors['account_type'] = 'account_type is required.'
        else:
            if self.isWallet:
                if not self.wallet_number:
                    errors['wallet_number'] = 'wallet_number is required for wallet accounts'
                if self.account_number:
                    errors['account_number'] = 'account_number must be empty for wallet accounts'
            else:
                if not self.account_number:
                    errors['account_number'] = 'account_number is required for non-wallet accounts'
                if self.wallet_number:
                    errors['wallet_number'] = 'wallet_number must be empty for non-wallet accounts'

        if errors:
            raise ValidationError(errors)

    def save(self, *args, **kwargs):
        self.full_clean()
        super().save(*args, **kwargs)

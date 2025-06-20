# fintrack_app/models/transaction.py
from django.db import models
from django.contrib.auth.models import User
from django.core.exceptions import ValidationError
from .account import Account
from .category import Category as UserCategory  # the per-user category model

class Transaction(models.Model):
    class Transaction_type(models.TextChoices):
        MYINCOME  = 'In', 'INCOME'
        MYEXPENSE = 'Ex', 'EXPENSE'

    user = models.ForeignKey(
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
    # ← store just the name; not a FK
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
        db_table  = 'transaction'
        ordering  = ['-date']

    def clean(self):
        super().clean()
        errs = {}
        if not self.user.accounts.filter(id=self.account_id).exists():
            errs['account'] = 'Account does not belong to the user.'
        if self.isRecurring and not (self.recurringInterval and self.nextRecurringDate):
            errs['recurringInterval']  = 'Required for recurring transactions'
            errs['nextRecurringDate']  = 'Required for recurring transactions'
        if errs:
            raise ValidationError(errs)

    def save(self, *args, **kwargs):
        """
        On create/update, adjust the per-user Category.total_amount automatically.
        """
        # 1) Determine if this is a new record or an update
        is_new = self.pk is None
        old_data = None
        if not is_new:
            old = Transaction.objects.get(pk=self.pk)
            old_data = {
                'type':     old.transaction_type,
                'category': old.category,
                'amount':   old.amount,
            }

        # 2) Run full_clean / actual save
        self.full_clean()
        super().save(*args, **kwargs)

        # 3) Increment the new category total
        new_cat_obj, _ = UserCategory.objects.get_or_create(
            user=self.user,
            transaction_type=self.transaction_type,
            category=self.category,
            defaults={'total_amount': 0}
        )
        new_cat_obj.total_amount += self.amount
        new_cat_obj.save()

        # 4) If update, decrement the old category total
        if not is_new and old_data:
            old_cat_obj = UserCategory.objects.get(
                user=self.user,
                transaction_type=old_data['type'],
                category=old_data['category']
            )
            old_cat_obj.total_amount -= old_data['amount']
            old_cat_obj.save()

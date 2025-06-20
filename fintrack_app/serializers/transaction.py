# fintrack_app/serializers/transaction.py

from rest_framework import serializers
from django.db import transaction as db_transaction
from fintrack_app.models import Transaction, Category as UserCategory, Account
from fintrack_app.services.budget_service import BudgetService

class TransactionSerializer(serializers.ModelSerializer):
    transaction_type = serializers.ChoiceField(
        choices=Transaction.Transaction_type.choices
    )
    # category choices will be set dynamically in __init__
    category = serializers.ChoiceField(choices=[])

    class Meta:
        model = Transaction
        fields = [
            'id',
            'transaction_type',
            'account',
            'category',
            'amount',
            'description',
            'date',
            'receiptPath',
            'isRecurring',
            'recurringInterval',
            'nextRecurringDate',
            'lastProcessedDate',
        ]
        read_only_fields = ['id']

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        request = self.context.get('request', None)

        # 1) filter account queryset to the authenticated user's accounts
        if request and request.user.is_authenticated:
            self.fields['account'].queryset = Account.objects.filter(user=request.user)
        else:
            self.fields['account'].queryset = Account.objects.none()

        # 2) determine selected transaction_type for category filtering
        tx_type = None
        if request and hasattr(request, 'data') and isinstance(request.data, dict):
            tx_type = request.data.get('transaction_type')
        elif self.instance:
            tx_type = self.instance.transaction_type

        # 3) build allowed name sets
        income_names = {
            UserCategory.NameChoices.SALARY,
            UserCategory.NameChoices.INVESTMENTS,
            UserCategory.NameChoices.FREELANCE,
            UserCategory.NameChoices.OTHERS,
        }
        all_names = {c.value for c in UserCategory.NameChoices}
        expense_names = all_names - income_names

        if tx_type == Transaction.Transaction_type.MYINCOME:
            allowed = income_names
        elif tx_type == Transaction.Transaction_type.MYEXPENSE:
            allowed = expense_names
        else:
            # if no type chosen, show all
            allowed = income_names | expense_names

        # 4) set category dropdown choices
        self.fields['category'].choices = [(v, v) for v in sorted(allowed)]

    def validate(self, data):
        tx_type  = data.get('transaction_type')
        cat_name = data.get('category')

        income_names = {
            UserCategory.NameChoices.SALARY,
            UserCategory.NameChoices.INVESTMENTS,
            UserCategory.NameChoices.FREELANCE,
            UserCategory.NameChoices.OTHERS,
        }
        all_names = {c.value for c in UserCategory.NameChoices}
        expense_names = all_names - income_names

        if tx_type == Transaction.Transaction_type.MYINCOME and cat_name not in income_names:
            raise serializers.ValidationError({
                'category': f"'{cat_name}' is not a valid Income category."
            })
        if tx_type == Transaction.Transaction_type.MYEXPENSE and cat_name not in expense_names:
            raise serializers.ValidationError({
                'category': f"'{cat_name}' is not a valid Expense category."
            })

        return data

    @db_transaction.atomic
    def create(self, validated_data):
        # pop user if passed in, fallback to request user
        user = validated_data.pop('user', self.context['request'].user)
        tx_type  = validated_data.pop('transaction_type')
        cat_name = validated_data.pop('category')
        account  = validated_data.pop('account')
        amount   = validated_data.pop('amount')

        # map Transaction type to UserCategory transaction_type
        cat_type = (
            UserCategory.TransactionType.INCOME
            if tx_type == Transaction.Transaction_type.MYINCOME
            else UserCategory.TransactionType.EXPENSE
        )

        # get or create the per-user Category record
        cat_obj, _ = UserCategory.objects.get_or_create(
            user=user,
            transaction_type=cat_type,
            category=cat_name,
            defaults={'total_amount': 0}
        )

        # update account balance
        if tx_type == Transaction.Transaction_type.MYINCOME:
            account.balance += amount
        else:
            account.balance -= amount
        account.save()

        # update category total_amount
        cat_obj.total_amount += amount
        cat_obj.save()

        # create the Transaction record
        tx = Transaction.objects.create(
            user=user,
            transaction_type=tx_type,
            account=account,
            category=cat_name,
            amount=amount,
            **validated_data
        )

        # budget notification
        BudgetService.check_and_notify_budget(cat_obj)
        return tx

    @db_transaction.atomic
    def update(self, instance, validated_data):
        user     = self.context['request'].user
        old_type = instance.transaction_type
        old_name = instance.category
        old_amt  = instance.amount
        old_acc  = instance.account

        new_type = validated_data.get('transaction_type', old_type)
        new_name = validated_data.get('category',        old_name)
        new_amt  = validated_data.get('amount',          old_amt)
        new_acc  = validated_data.get('account',         old_acc)

        # reverse old account balance
        if old_type == Transaction.Transaction_type.MYINCOME:
            old_acc.balance -= old_amt
        else:
            old_acc.balance += old_amt
        old_acc.save()

        # apply new account balance
        if new_type == Transaction.Transaction_type.MYINCOME:
            new_acc.balance += new_amt
        else:
            new_acc.balance -= new_amt
        new_acc.save()

        # helper to map transaction type to UserCategory.TransactionType
        def map_cat_type(t):
            return (
                UserCategory.TransactionType.INCOME
                if t == Transaction.Transaction_type.MYINCOME
                else UserCategory.TransactionType.EXPENSE
            )

        old_cat_type = map_cat_type(old_type)
        new_cat_type = map_cat_type(new_type)

        if new_type != old_type or new_name != old_name:
            # decrement old category total
            old_cat_obj = UserCategory.objects.get(
                user=user,
                transaction_type=old_cat_type,
                category=old_name
            )
            old_cat_obj.total_amount -= old_amt
            old_cat_obj.save()

            # increment or create new category total
            new_cat_obj, _ = UserCategory.objects.get_or_create(
                user=user,
                transaction_type=new_cat_type,
                category=new_name,
                defaults={'total_amount': 0}
            )
            new_cat_obj.total_amount += new_amt
            new_cat_obj.save()
            target = new_name
        else:
            # same category: adjust by delta
            delta = new_amt - old_amt
            cat_obj = UserCategory.objects.get(
                user=user,
                transaction_type=old_cat_type,
                category=old_name
            )
            cat_obj.total_amount += delta
            cat_obj.save()
            target = old_name

        # budget re-check
        BudgetService.check_and_notify_budget(
            UserCategory.objects.get(
                user=user,
                transaction_type=new_cat_type,
                category=target
            )
        )

        # update transaction fields
        for f in [
            'description','date','receiptPath',
            'isRecurring','recurringInterval',
            'nextRecurringDate','lastProcessedDate'
        ]:
            if f in validated_data:
                setattr(instance, f, validated_data[f])

        instance.transaction_type = new_type
        instance.account          = new_acc
        instance.category         = target
        instance.amount           = new_amt
        instance.save()

        return instance

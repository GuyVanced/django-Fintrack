from rest_framework import serializers
from django.db import transaction as db_transaction
from fintrack_app.models import Transaction, UserCategory
from fintrack_app.models.master_category import MasterCategory
from fintrack_app.models.account import Account
from fintrack_app.services.budget_service import BudgetService

class TransactionSerializer(serializers.ModelSerializer):
    transaction_type = serializers.ChoiceField(
        choices=Transaction.TransactionType.choices
    )
    category = serializers.SlugRelatedField(
        slug_field='name',
        queryset=MasterCategory.objects.all()
    )

    class Meta:
        model = Transaction
        fields = [
            'id', 'transaction_type', 'account', 'category',
            'amount', 'description', 'date', 'receiptPath',
            'isRecurring', 'recurringInterval',
            'nextRecurringDate', 'lastProcessedDate',
        ]
        read_only_fields = ['id']

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            self.fields['account'].queryset = Account.objects.filter(user=request.user)
        else:
            self.fields['account'].queryset = Account.objects.none()

        tx_type = None
        if request and hasattr(request, 'data'):
            tx_type = request.data.get('transaction_type')
        elif self.instance:
            tx_type = self.instance.transaction_type

        valid_types = MasterCategory.TransactionType.values
        if tx_type in valid_types:
            qs = MasterCategory.objects.filter(transaction_type=tx_type)
        else:
            qs = MasterCategory.objects.all()
        self.fields['category'].queryset = qs

    def validate_amount(self, value):
        """
        Ensure that the transaction amount is not negative.
        """
        if value < 0:
            raise serializers.ValidationError("Amount cannot be negative.")
        return value

    def validate(self, data):
        if data['category'].transaction_type != data['transaction_type']:
            raise serializers.ValidationError({'category': 'Mismatched transaction type for category.'})
        return data

    @db_transaction.atomic
    def create(self, validated_data):
        user = self.context['request'].user
        master_cat = validated_data.pop('category')
        tx_type    = validated_data.pop('transaction_type')
        account    = validated_data.pop('account')
        amount     = validated_data.pop('amount')

        # get or create per-user category record
        user_cat, _ = UserCategory.objects.get_or_create(
            user=user,
            master_category=master_cat,
            defaults={'total_amount': 0}
        )
        # update account balance
        if tx_type == Transaction.TransactionType.INCOME:
            account.balance += amount
        else:
            account.balance -= amount
        account.save()

        # update category total
        user_cat.total_amount += amount
        user_cat.save()

        tx = Transaction.objects.create(
            user=user,
            transaction_type=tx_type,
            account=account,
            category=master_cat,
            amount=amount,
            **validated_data
        )

        BudgetService.check_and_notify_budget(user_cat)
        return tx

    @db_transaction.atomic
    def update(self, instance, validated_data):
        user = self.context['request'].user
        old_type = instance.transaction_type
        old_cat = instance.category
        old_amt = instance.amount
        old_acc = instance.account

        new_type = validated_data.get('transaction_type', old_type)
        new_cat  = validated_data.get('category', old_cat)
        new_amt  = validated_data.get('amount', old_amt)
        new_acc  = validated_data.get('account', old_acc)

        def effect(tx_type, amt):
            return amt if tx_type == Transaction.TransactionType.INCOME else -amt
        
        old_effect = effect(old_type, old_amt)
        new_effect = effect(new_type, new_amt)
        
        net_delta = -old_effect + new_effect

        new_acc.balance += net_delta
        new_acc.save(update_fields=['balance'])

        # # reverse old account balance
        # if old_type == Transaction.TransactionType.INCOME:
        #     old_acc.balance -= old_amt
        # else:
        #     old_acc.balance += old_amt
        # old_acc.save()

        # # apply new account balance
        # if new_type == Transaction.TransactionType.INCOME:
        #     new_acc.balance += new_amt
        # else:
        #     new_acc.balance -= new_amt
        # new_acc.save()

        # adjust user-category totals
        if new_type != old_type or new_cat != old_cat:
            prev_uc = UserCategory.objects.get(
                user=user,
                master_category=old_cat
            )
            prev_uc.total_amount -= old_amt
            prev_uc.save()

            new_uc, _ = UserCategory.objects.get_or_create(
                user=user,
                master_category=new_cat,
                defaults={'total_amount': 0}
            )
            new_uc.total_amount += new_amt
            new_uc.save()
            target_uc = new_uc
        else:
            uc = UserCategory.objects.get(
                user=user,
                master_category=old_cat
            )
            uc.total_amount += (new_amt - old_amt)
            uc.save()
            target_uc = uc

        BudgetService.check_and_notify_budget(target_uc)

        for attr in ['description','date','receiptPath','isRecurring','recurringInterval','nextRecurringDate','lastProcessedDate']:
            if attr in validated_data:
                setattr(instance, attr, validated_data[attr])

        instance.transaction_type = new_type
        instance.account          = new_acc
        instance.category         = new_cat
        instance.amount           = new_amt
        instance.save()
        return instance
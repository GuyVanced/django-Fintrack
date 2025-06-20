# fintrack_app/serializers/transaction.py

from rest_framework import serializers
from fintrack_app.models import Transaction, Category as UserCategory

class TransactionSerializer(serializers.ModelSerializer):
    transaction_type = serializers.ChoiceField(
        choices=Transaction.Transaction_type.choices
    )
    # start with no choices; we'll populate in __init__
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

        # figure out which transaction_type is selected
        tx_type = None
        req = self.context.get('request')
        if req is not None and hasattr(req, 'data') and isinstance(req.data, dict):
            tx_type = req.data.get('transaction_type')
        elif self.instance is not None:
            tx_type = self.instance.transaction_type

        # build allowed name sets
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
            # if no type chosen yet, show all
            allowed = income_names | expense_names

        # apply to the category field
        self.fields['category'].choices = [(v, v) for v in sorted(allowed)]

    def validate(self, data):
        """
        Ensure that the chosen category name matches the transaction_type.
        """
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

        if tx_type == Transaction.Transaction_type.MYINCOME:
            if cat_name not in income_names:
                raise serializers.ValidationError({
                    'category': f"'{cat_name}' is not a valid Income category."
                })
        else:
            if cat_name not in expense_names:
                raise serializers.ValidationError({
                    'category': f"'{cat_name}' is not a valid Expense category."
                })

        return data

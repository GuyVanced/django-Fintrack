from rest_framework import serializers
from fintrack_app.models import Category

class CategorySerializer(serializers.ModelSerializer):
    # expose transaction_type so it shows up on the form
    transaction_type = serializers.ChoiceField(
        choices=Category.TransactionType.choices
    )
    # we’ll override the default choices in __init__
    category = serializers.ChoiceField(choices=[])

    class Meta:
        model = Category
        fields = ['id', 'transaction_type', 'category', 'total_amount']
        read_only_fields = ['id', 'total_amount']

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)

        # 1) try POST/PUT payload
        req = self.context.get('request', None)
        tx_type = None
        if req is not None:
            # for a POST/PUT call
            if hasattr(req, 'data') and isinstance(req.data, dict):
                tx_type = req.data.get('transaction_type')
            # for a GET-list AJAX call
            if tx_type is None:
                tx_type = req.query_params.get('transaction_type')

        # build two sets of allowed names
        income_set = {
            Category.NameChoices.SALARY,
            Category.NameChoices.INVESTMENTS,
            Category.NameChoices.FREELANCE,
            Category.NameChoices.OTHERS
        }
        expense_set = set(c.value for c in Category.NameChoices) - income_set

        if tx_type == Category.TransactionType.INCOME:
            allowed = income_set
        elif tx_type == Category.TransactionType.EXPENSE:
            allowed = expense_set
        else:
            # no type chosen yet—show everything
            allowed = income_set | expense_set

        # now overwrite the choices for that field
        self.fields['category'].choices = [
            (v, v) for v in allowed
        ]

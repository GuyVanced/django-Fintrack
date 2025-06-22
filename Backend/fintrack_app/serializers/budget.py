# fintrack_app/serializers/budget.py

from rest_framework import serializers
from fintrack_app.models import Budget, UserCategory
from fintrack_app.models.master_category import MasterCategory

class BudgetSerializer(serializers.ModelSerializer):
    # Users will POST a master_category id here (all Ex types)
    master_category = serializers.PrimaryKeyRelatedField(
        queryset=MasterCategory.objects.filter(
            transaction_type=MasterCategory.TransactionType.EXPENSE
        ),
        write_only=True
    )

    # Once created, we’ll show them the actual UserCategory record
    category = serializers.PrimaryKeyRelatedField(
        read_only=True
    )

    category_name = serializers.CharField(
        source='category.master_category.name',
        read_only=True
    )
    

    class Meta:
        model = Budget
        fields = [
            'id',
            'budget_amount',
            'is_exceed',
            'master_category',  # write-only
            'category',         # read-only UserCategory FK
            'category_name'
        
        ]
        read_only_fields = ['id', 'is_exceed', 'category', 'category_name']

    def validate_budget_amount(self, value):
        """
        Ensure that the budget amount is not negative or zero.
        """
        if value <= 0:
            raise serializers.ValidationError("Budget amount must be greater than zero.")
        return value
    

    def validate_master_category(self, value):
        """
        Prevent a second Budget for the same user+category.
        """
        user = self.context['request'].user
        # See if there’s already a Budget pointing at this master-category
        exists = Budget.objects.filter(
            user=user,
            category__master_category=value
        ).exists()
        if exists:
            raise serializers.ValidationError(
                "You already have a budget for that category."
            )
        return value

    def create(self, validated_data):
        user = self.context['request'].user

        # pull out the master-category they posted
        master_cat = validated_data.pop('master_category')

        # get or make the per-user category row
        user_cat, _ = UserCategory.objects.get_or_create(
            user=user,
            master_category=master_cat,
            defaults={'total_amount': 0}
        )

        # now build the Budget against that UserCategory
        budget = Budget.objects.create(
            user=user,
            category=user_cat,
            **validated_data
        )

        return budget
    
    def update(self, instance, validated_data):
        """
        Only allow updating the budget_amount on an existing Budget.
        Skip the master_category uniqueness check when it's unchanged.
        """
        # Update only the budget_amount field
        new_amount = validated_data.get('budget_amount')
        if new_amount is not None:
            instance.budget_amount = new_amount
            instance.save(update_fields=['budget_amount'])

        return instance
    

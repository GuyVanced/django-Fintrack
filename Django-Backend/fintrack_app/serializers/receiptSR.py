from rest_framework import serializers
import re

class ItemSerializer(serializers.Serializer):
    name = serializers.CharField(allow_null=True)
    quantity = serializers.FloatField(allow_null=True)
    unit_price = serializers.FloatField(allow_null=True)
    total = serializers.FloatField(allow_null=True)

class ReceiptImageUploadSerializer(serializers.Serializer):
    image = serializers.ImageField()

class ReceiptSerializer(serializers.Serializer):
    merchant = serializers.CharField(allow_null=True)
    date = serializers.CharField(allow_null=True)  # YYYY-MM-DD
    items = serializers.ListField(
        child=ItemSerializer(),
        allow_empty=True
    )
    total = serializers.FloatField(allow_null=True)
    category = serializers.ChoiceField(
        allow_null=True,
        choices=[
            "Food", "Income", "Housing", "Groceries",
            "Electronics", "Transportation", "Dining",
            "Healthcare", "Shopping", "Entertainment",
            "Utilities", "Other"
        ]
    )
    completeness = serializers.FloatField(       # renamed field
        min_value=0,
        max_value=100,
        allow_null=True
    )
    description = serializers.CharField(allow_null=True)

    def validate_date(self, value):
        if value and not re.match(r'^\d{4}-\d{2}-\d{2}$', value):
            raise serializers.ValidationError("Date must be YYYY-MM-DD")
        return value

# fintrack_app/serializers/category.py

from rest_framework import serializers
from fintrack_app.models.category import UserCategory
from fintrack_app.models.master_category import MasterCategory
from fintrack_app.serializers.master_category import MasterCategorySerializer

class UserCategorySerializer(serializers.ModelSerializer):
    # Read the full master‐category object...
    master_category = MasterCategorySerializer(read_only=True)
    # …but accept an incoming master_category_id when you create one
    master_category_id = serializers.PrimaryKeyRelatedField(
        source='master_category',
        queryset=MasterCategory.objects.all(),
        write_only=True
    )

    class Meta:
        model = UserCategory
        fields = [
            'id',
            'master_category',     # nested read-only
            'master_category_id',  # write-only FK
            'total_amount',
        ]
        read_only_fields = ['id', 'master_category', 'total_amount']

# fintrack_app/serializers/master_category.py

from rest_framework import serializers
from fintrack_app.models.master_category import MasterCategory

class MasterCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = MasterCategory
        fields = ['id', 'transaction_type', 'name']

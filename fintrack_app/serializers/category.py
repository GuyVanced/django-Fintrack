from rest_framework import serializers
from fintrack_app.models import Category

class CategorySerializer(serializers.ModelSerializer):
    
    class Meta:
        model=Category
        fields=['id','user','category','total_amount']

    def validate_total(self,value):
            errors={}

            if self.value<0:
                errors['total_amount']='total should be greater than or equals to 0'    

            if errors:
                raise serializers.ValidationError(errors)
            
            return value
            


                 
# from rest_framework import serializers
# from fintrack_app.models.user import User


# class UserSerializer(serializers.ModelSerializer):
#     class Meta:
#         model=User
#         fields=['id','email','name','password','imageUrl']
#         extra_kwargs={'password':{'write_only':True}}

                

#     def validate_password(self,value):
#         errors={}
#         if len(value)<8:
#             errors['password']="Password must be at least 8 characters"
                    
#         if errors:
#             raise serializers.ValidationError(errors)
#         return value
       
#     def create(self,validated_data):
#         #     user=User(
#         #     username=validated_data['username'],
#         #     email=validated_data['email'],
#         #     name=validated_data['name'],
           
#         #     imageUrl=validated_data.get('imageUrl', None)
#         # ) 
#             user=User(**validated_data)
        
#             user.set_password(validated_data['password'])
#             user.save()
#             return user
    
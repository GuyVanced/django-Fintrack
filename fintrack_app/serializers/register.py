# # from dj_rest_auth.registration.serializers import RegisterSerializer
# # from rest_framework import serializers

# # class CustomRegisterSerializer(RegisterSerializer):
    
# #     def get_cleaned_data(self):
# #         return {
# #             'email': self.validated_data.get('email', ''),
# #             'password1': self.validated_data.get('password1', ''),
# #             'password2': self.validated_data.get('password2', ''),
# #         }
# # yourapp/serializers.py

# from dj_rest_auth.registration.serializers import RegisterSerializer
# from dj_rest_auth.serializers import LoginSerializer
# from rest_framework import serializers

# class CustomRegisterSerializer(RegisterSerializer):
#     username = None
#     email = serializers.EmailField(required=True)

#     def validate_email(self, email):
#         raise serializers.ValidationError("Custom email validation hit!")

#     def __init__(self, *args, **kwargs):
#         print("🧩 CustomRegisterSerializer INIT")
#         super().__init__(*args, **kwargs)

#     def get_cleaned_data(self):
#         data = super().get_cleaned_data()
#         data.pop('username', None)
#         return {
#             'email': data.get('email', ''),
#             'password1': data.get('password1', ''),
#             'password2': data.get('password2', ''),
#         }

#     def save(self, request):
#         print("🔥 CustomRegisterSerializer SAVE CALLED")
#         return super().save(request)


# class CustomLoginSerializer(LoginSerializer):
#     username = None
#     email = serializers.EmailField(required=True)

#     def validate(self, attrs):
#         attrs['username'] = attrs.get('email')  # Treat email as username
#         return super().validate(attrs)
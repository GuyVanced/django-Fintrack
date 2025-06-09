# from django.db import models
# from django.contrib.auth.models import AbstractUser
# from .usermanager import CustomUserManager


# class User(AbstractUser):
#     id = models.AutoField(primary_key=True)
#     # clerkUserId=models.CharField(max_length=100,unique=True)
#     name = models.CharField(max_length=100)
#     username=None
#     imageUrl = models.CharField(max_length=500, null=True, blank=True)
#     createdAt = models.DateTimeField(auto_now_add=True)
#     updatedAt = models.DateTimeField(auto_now=True)
#     email=models.EmailField(unique=True,max_length=255)

#     USERNAME_FIELD='email'
#     REQUIRED_FIELDS=[]

#     objects=CustomUserManager()

#     def __str__(self):
#         return self.email

#     class Meta:
#         db_table = 'user'
#         ordering = ['-createdAt']

from django.db import models
from django.contrib.auth.models import User


class Category(models.Model):
    user=models.ForeignKey(User,on_delete=models.CASCADE,related_name='categories')
    category=models.CharField(max_length=100)
    total_amount = models.BigIntegerField(default=0)


    def __str__(self):
        return self.category





    




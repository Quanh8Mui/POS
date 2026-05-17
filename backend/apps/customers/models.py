from django.db import models


class Customer(models.Model):
    user = models.OneToOneField('accounts.User', on_delete=models.SET_NULL, null=True, blank=True, related_name='customer_profile')
    full_name = models.CharField(max_length=150)
    phone = models.CharField(max_length=20, unique=True, null=True, blank=True)
    email = models.EmailField(unique=True, null=True, blank=True)
    loyalty_points = models.IntegerField(default=0)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['full_name']

    def __str__(self):
        return self.full_name

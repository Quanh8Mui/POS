from rest_framework import serializers

from .models import Customer


class CustomerSerializer(serializers.ModelSerializer):
    user_id = serializers.IntegerField(source='user.id', read_only=True)
    username = serializers.CharField(source='user.username', read_only=True)

    class Meta:
        model = Customer
        fields = '__all__'

from django.contrib.auth import get_user_model
from rest_framework import serializers

User = get_user_model()


class UserSerializer(serializers.ModelSerializer):
    customer_id = serializers.IntegerField(source='customer_profile.id', read_only=True)
    phone = serializers.CharField(source='customer_profile.phone', read_only=True)
    email_address = serializers.EmailField(source='customer_profile.email', read_only=True)
    password = serializers.CharField(write_only=True, required=False, allow_blank=False)

    class Meta:
        model = User
        fields = ('id', 'username', 'full_name', 'role', 'branch', 'is_active', 'password', 'customer_id', 'phone', 'email_address')

    def create(self, validated_data):
        password = validated_data.pop('password', None)
        user = User(**validated_data)
        if password:
            user.set_password(password)
        else:
            user.set_password('12345678')
        user.save()
        return user

    def update(self, instance, validated_data):
        password = validated_data.pop('password', None)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        if password:
            instance.set_password(password)
        instance.save()
        return instance


class LoginSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField(write_only=True)


class RegisterSerializer(serializers.Serializer):
    full_name = serializers.CharField(max_length=150)
    username = serializers.CharField(max_length=150)
    password = serializers.CharField(write_only=True)
    phone = serializers.CharField(required=False, allow_blank=True)
    email = serializers.EmailField(required=False, allow_blank=True)


class ChangePasswordSerializer(serializers.Serializer):
    current_password = serializers.CharField(write_only=True)
    new_password = serializers.CharField(write_only=True, min_length=8)

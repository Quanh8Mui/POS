from rest_framework import serializers

from .models import LoyaltyTransaction, PricingPolicy, Promotion, SalesOrder, SalesOrderItem, StockMovement


class PricingPolicySerializer(serializers.ModelSerializer):
    class Meta:
        model = PricingPolicy
        fields = '__all__'


class PromotionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Promotion
        fields = '__all__'


class SalesOrderItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = SalesOrderItem
        fields = '__all__'


class SalesOrderSerializer(serializers.ModelSerializer):
    items = SalesOrderItemSerializer(many=True, read_only=True)
    pricing_policy_detail = PricingPolicySerializer(source='pricing_policy', read_only=True)
    promotion_detail = PromotionSerializer(source='promotion', read_only=True)

    class Meta:
        model = SalesOrder
        fields = '__all__'


class LoyaltyTransactionSerializer(serializers.ModelSerializer):
    class Meta:
        model = LoyaltyTransaction
        fields = '__all__'


class StockMovementSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(source='product.name', read_only=True)
    product_sku = serializers.CharField(source='product.sku', read_only=True)
    branch_name = serializers.CharField(source='branch.name', read_only=True)
    created_by_name = serializers.CharField(source='created_by.full_name', read_only=True)

    class Meta:
        model = StockMovement
        fields = '__all__'

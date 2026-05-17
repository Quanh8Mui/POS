from rest_framework import serializers

from .models import Category, Inventory, Product


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = '__all__'


class ProductSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source='category.name', read_only=True)

    class Meta:
        model = Product
        fields = '__all__'


class InventorySerializer(serializers.ModelSerializer):
    is_low_stock = serializers.SerializerMethodField()
    product_name = serializers.CharField(source='product.name', read_only=True)
    product_sku = serializers.CharField(source='product.sku', read_only=True)
    product_sale_price = serializers.DecimalField(source='product.sale_price', read_only=True, max_digits=12, decimal_places=2)
    branch_name = serializers.CharField(source='branch.name', read_only=True)

    class Meta:
        model = Inventory
        fields = '__all__'

    def get_is_low_stock(self, obj):
        return obj.is_low_stock

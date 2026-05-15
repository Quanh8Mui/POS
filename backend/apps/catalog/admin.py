from django.contrib import admin

from .models import Category, Inventory, Product


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ('name', 'parent', 'sort_order', 'is_active')
    search_fields = ('name',)
    list_filter = ('is_active',)


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ('sku', 'name', 'category', 'sale_price', 'is_active')
    search_fields = ('sku', 'barcode', 'name')
    list_filter = ('is_active', 'category')


@admin.register(Inventory)
class InventoryAdmin(admin.ModelAdmin):
    list_display = ('branch', 'product', 'quantity_on_hand', 'reorder_level', 'is_low_stock', 'updated_at')
    search_fields = ('branch__name', 'product__name', 'product__sku')
    list_filter = ('branch',)

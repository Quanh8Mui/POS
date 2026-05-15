from django.contrib import admin

from .models import LoyaltyTransaction, Promotion, SalesOrder, SalesOrderItem, StockMovement


class SalesOrderItemInline(admin.TabularInline):
    model = SalesOrderItem
    extra = 0


@admin.register(SalesOrder)
class SalesOrderAdmin(admin.ModelAdmin):
    list_display = ('order_code', 'branch', 'cashier', 'customer', 'total_amount', 'status', 'created_at')
    list_filter = ('status', 'payment_method', 'branch')
    search_fields = ('order_code',)
    inlines = [SalesOrderItemInline]


@admin.register(Promotion)
class PromotionAdmin(admin.ModelAdmin):
    list_display = ('name', 'type', 'value', 'start_at', 'end_at', 'is_active')
    list_filter = ('type', 'is_active')
    search_fields = ('name',)


@admin.register(LoyaltyTransaction)
class LoyaltyTransactionAdmin(admin.ModelAdmin):
    list_display = ('customer', 'sale_order', 'transaction_type', 'points_earned', 'points_used', 'balance_after', 'created_at')
    list_filter = ('transaction_type',)


@admin.register(StockMovement)
class StockMovementAdmin(admin.ModelAdmin):
    list_display = ('branch', 'product', 'movement_type', 'quantity', 'created_by', 'created_at')
    list_filter = ('movement_type', 'branch')
    search_fields = ('product__name', 'product__sku')

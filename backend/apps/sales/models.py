from django.db import models


class Promotion(models.Model):
    class PromotionType(models.TextChoices):
        PERCENT = 'percent', 'Percent'
        FIXED = 'fixed', 'Fixed amount'

    name = models.CharField(max_length=150)
    type = models.CharField(max_length=30, choices=PromotionType.choices)
    value = models.DecimalField(max_digits=12, decimal_places=2)
    start_at = models.DateTimeField()
    end_at = models.DateTimeField()
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name


class SalesOrder(models.Model):
    class PaymentMethod(models.TextChoices):
        CASH = 'cash', 'Cash'
        CARD = 'card', 'Card'
        MIXED = 'mixed', 'Mixed'

    class Status(models.TextChoices):
        COMPLETED = 'completed', 'Completed'
        VOID = 'void', 'Void'
        DRAFT = 'draft', 'Draft'

    order_code = models.CharField(max_length=30, unique=True)
    branch = models.ForeignKey('branches.Branch', on_delete=models.PROTECT, related_name='sales_orders')
    cashier = models.ForeignKey('accounts.User', on_delete=models.PROTECT, related_name='sales_orders')
    customer = models.ForeignKey('customers.Customer', on_delete=models.SET_NULL, null=True, blank=True, related_name='sales_orders')
    promotion = models.ForeignKey(Promotion, on_delete=models.SET_NULL, null=True, blank=True, related_name='sales_orders')
    subtotal = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    discount_amount = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    tax_amount = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    total_amount = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    payment_method = models.CharField(max_length=30, choices=PaymentMethod.choices)
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.COMPLETED)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.order_code


class SalesOrderItem(models.Model):
    sale_order = models.ForeignKey(SalesOrder, on_delete=models.CASCADE, related_name='items')
    product = models.ForeignKey('catalog.Product', on_delete=models.PROTECT, related_name='sale_items')
    quantity = models.IntegerField()
    unit_price = models.DecimalField(max_digits=12, decimal_places=2)
    discount_amount = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    line_total = models.DecimalField(max_digits=12, decimal_places=2)


class LoyaltyTransaction(models.Model):
    class TransactionType(models.TextChoices):
        EARN = 'earn', 'Earn'
        REDEEM = 'redeem', 'Redeem'
        ADJUST = 'adjust', 'Adjust'

    customer = models.ForeignKey('customers.Customer', on_delete=models.PROTECT, related_name='loyalty_transactions')
    sale_order = models.ForeignKey(SalesOrder, on_delete=models.SET_NULL, null=True, blank=True, related_name='loyalty_transactions')
    points_earned = models.IntegerField(default=0)
    points_used = models.IntegerField(default=0)
    balance_after = models.IntegerField()
    transaction_type = models.CharField(max_length=30, choices=TransactionType.choices)
    created_at = models.DateTimeField(auto_now_add=True)


class StockMovement(models.Model):
    class MovementType(models.TextChoices):
        SALE = 'sale', 'Sale'
        IMPORT = 'import', 'Import'
        ADJUST = 'adjust', 'Adjust'
        RETURN = 'return', 'Return'

    branch = models.ForeignKey('branches.Branch', on_delete=models.PROTECT, related_name='stock_movements')
    product = models.ForeignKey('catalog.Product', on_delete=models.PROTECT, related_name='stock_movements')
    movement_type = models.CharField(max_length=30, choices=MovementType.choices)
    quantity = models.IntegerField()
    reference_type = models.CharField(max_length=30, blank=True)
    reference_id = models.BigIntegerField(null=True, blank=True)
    note = models.CharField(max_length=255, blank=True)
    created_by = models.ForeignKey('accounts.User', on_delete=models.SET_NULL, null=True, blank=True, related_name='stock_movements')
    created_at = models.DateTimeField(auto_now_add=True)

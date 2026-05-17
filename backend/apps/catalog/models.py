from django.db import models


class Category(models.Model):
    name = models.CharField(max_length=150, unique=True)
    parent = models.ForeignKey('self', on_delete=models.SET_NULL, null=True, blank=True, related_name='children')
    sort_order = models.IntegerField(default=0)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['sort_order', 'name']

    def __str__(self):
        return self.name


class Product(models.Model):
    sku = models.CharField(max_length=50, unique=True)
    barcode = models.CharField(max_length=50, unique=True, null=True, blank=True)
    name = models.CharField(max_length=200)
    category = models.ForeignKey(Category, on_delete=models.PROTECT, related_name='products')
    unit = models.CharField(max_length=20)
    cost_price = models.DecimalField(max_digits=12, decimal_places=2)
    sale_price = models.DecimalField(max_digits=12, decimal_places=2)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['name']

    def __str__(self):
        return self.name


class Inventory(models.Model):
    branch = models.ForeignKey('branches.Branch', on_delete=models.CASCADE, related_name='inventory_items')
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='inventory_items')
    quantity_on_hand = models.IntegerField(default=0)
    reorder_level = models.IntegerField(default=0)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        constraints = [models.UniqueConstraint(fields=['branch', 'product'], name='unique_branch_product_inventory')]
        ordering = ['branch__name', 'product__name']

    @property
    def is_low_stock(self):
        return self.quantity_on_hand <= self.reorder_level

    def __str__(self):
        return f'{self.branch} - {self.product}'

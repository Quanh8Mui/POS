from decimal import Decimal

from django.contrib.auth import get_user_model
from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APIClient

from apps.branches.models import Branch
from apps.catalog.models import Category, Inventory, Product
from apps.customers.models import Customer
from apps.sales.models import PricingPolicy, Promotion, SalesOrder, StockMovement

User = get_user_model()


class SalesOrderCreateTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.branch = Branch.objects.create(
            code='TBR04',
            name='Central Branch Sales Test',
            address='12 Nguyen Trai',
            phone='0901000001',
            status='active',
        )
        self.cashier = User.objects.create_user(
            username='cashier-sales-test',
            password='Password123!',
            full_name='Cashier One',
            role=User.Role.CASHIER,
            branch=self.branch,
        )
        self.customer = Customer.objects.create(
            full_name='Test Customer',
            phone='0909000001',
            email='customer@example.com',
            loyalty_points=0,
        )
        self.category = Category.objects.create(name='Beverages', sort_order=1, is_active=True)
        self.product = Product.objects.create(
            sku='SKU-001',
            barcode='893000000001',
            name='Mineral Water',
            category=self.category,
            unit='bottle',
            cost_price=3000,
            sale_price=5000,
            is_active=True,
        )
        Inventory.objects.create(
            branch=self.branch,
            product=self.product,
            quantity_on_hand=20,
            reorder_level=5,
        )
        self.policy = PricingPolicy.objects.create(
            name='Default policy',
            vat_rate=10,
            is_active=True,
        )
        self.promotion = Promotion.objects.create(
            name='Weekend 10% Off',
            type=Promotion.PromotionType.PERCENT,
            value=10,
            start_at='2026-05-01T00:00:00Z',
            end_at='2026-06-01T00:00:00Z',
            is_active=True,
        )
        self.client.force_authenticate(user=self.cashier)

    def test_create_sale_updates_inventory_and_creates_order(self):
        response = self.client.post(
            reverse('sales-order-create-sale'),
            {
                'order_code': 'OD-TEST-001',
                'branch_id': self.branch.id,
                'cashier_id': self.cashier.id,
                'customer_id': self.customer.id,
                'promotion_id': self.promotion.id,
                'vat_rate': 10,
                'payment_method': 'cash',
                'discount_amount': 0,
                'tax_amount': 0,
                'total_amount': 5500,
                'items': [
                    {
                        'product_id': self.product.id,
                        'quantity': 1,
                        'unit_price': 5000,
                        'discount_amount': 0,
                    }
                ],
            },
            format='json',
        )

        self.assertEqual(response.status_code, 201)
        order = SalesOrder.objects.get(order_code='OD-TEST-001')
        self.assertEqual(order.branch, self.branch)
        self.assertEqual(order.cashier, self.cashier)
        self.assertEqual(order.customer, self.customer)
        self.assertEqual(order.promotion, self.promotion)
        self.assertEqual(order.pricing_policy, self.policy)
        self.assertEqual(order.subtotal, Decimal('5000.00'))
        self.assertEqual(order.tax_amount, Decimal('500.00'))
        self.assertEqual(order.total_amount, Decimal('5000.00'))

        inventory = Inventory.objects.get(branch=self.branch, product=self.product)
        self.assertEqual(inventory.quantity_on_hand, 19)
        self.assertTrue(StockMovement.objects.filter(branch=self.branch, product=self.product, movement_type='sale').exists())

    def test_create_sale_requires_items(self):
        response = self.client.post(
            reverse('sales-order-create-sale'),
            {
                'order_code': 'OD-TEST-002',
                'branch_id': self.branch.id,
                'cashier_id': self.cashier.id,
                'customer_id': self.customer.id,
                'payment_method': 'cash',
                'discount_amount': 0,
                'tax_amount': 0,
                'total_amount': 0,
                'items': [],
            },
            format='json',
        )

        self.assertEqual(response.status_code, 400)
        self.assertIn('items are required', response.data['detail'])

from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APIClient

from apps.branches.models import Branch
from apps.accounts.models import User
from .models import Category, Inventory, Product


class CatalogApiTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.branch = Branch.objects.create(
            code='TBR03',
            name='Central Branch Test',
            address='12 Nguyen Trai',
            phone='0901000001',
            status='active',
        )
        self.user = User.objects.create_user(
            username='admin-catalog-test',
            password='Password123!',
            full_name='Admin User',
            role=User.Role.ADMIN,
            branch=self.branch,
        )
        self.client.force_authenticate(user=self.user)

    def test_create_category(self):
        response = self.client.post(
            reverse('category-list'),
            {
                'name': 'Beverages',
                'parent': None,
                'sort_order': 1,
                'is_active': True,
            },
            format='json',
        )
        self.assertEqual(response.status_code, 201)
        self.assertTrue(Category.objects.filter(name='Beverages').exists())

    def test_create_product_and_inventory(self):
        category = Category.objects.create(name='Beverages', sort_order=1, is_active=True)
        response = self.client.post(
            reverse('product-list'),
            {
                'sku': 'SKU-001',
                'barcode': '893000000001',
                'name': 'Mineral Water',
                'category': category.id,
                'unit': 'bottle',
                'cost_price': 3000,
                'sale_price': 5000,
                'is_active': True,
            },
            format='json',
        )
        self.assertEqual(response.status_code, 201)
        self.assertTrue(Product.objects.filter(sku='SKU-001').exists())

        product = Product.objects.get(sku='SKU-001')
        inventory = Inventory.objects.create(branch=self.branch, product=product, quantity_on_hand=15, reorder_level=5)
        self.assertEqual(inventory.quantity_on_hand, 15)

from django.contrib.auth import get_user_model
from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APIClient

from .models import Customer

User = get_user_model()


class CustomerApiTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.admin = User.objects.create_user(
            username='test-admin-customer',
            password='Password123!',
            full_name='Admin User',
            role=User.Role.ADMIN,
        )
        self.client.force_authenticate(user=self.admin)

    def test_create_customer(self):
        response = self.client.post(
            reverse('customer-list'),
            {
                'full_name': 'Nguyen Van A',
                'phone': '0909000001',
                'email': 'a@example.com',
                'loyalty_points': 10,
                'is_active': True,
            },
            format='json',
        )
        self.assertEqual(response.status_code, 201)
        self.assertTrue(Customer.objects.filter(phone='0909000001').exists())

    def test_list_customers(self):
        Customer.objects.create(full_name='Nguyen Van A', phone='0909000001', email='a@example.com')
        response = self.client.get(reverse('customer-list'))
        self.assertEqual(response.status_code, 200)
        self.assertGreaterEqual(len(response.data), 1)

from django.contrib.auth import get_user_model
from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APIClient

from apps.branches.models import Branch
from apps.customers.models import Customer

User = get_user_model()


class AuthApiTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.branch = Branch.objects.create(
            code='TBR01',
            name='Test Central Branch',
            address='12 Nguyen Trai',
            phone='0901000001',
            status='active',
        )

    def test_register_creates_customer_account(self):
        response = self.client.post(
            '/api/accounts/register/',
            {
                'full_name': 'Test Customer',
                'username': 'testcustomer',
                'password': 'Password123!',
                'phone': '0909000999',
                'email': 'test@example.com',
            },
            format='json',
        )

        self.assertEqual(response.status_code, 201)
        self.assertTrue(User.objects.filter(username='testcustomer').exists())
        user = User.objects.get(username='testcustomer')
        self.assertEqual(user.role, User.Role.CUSTOMER)
        self.assertTrue(Customer.objects.filter(user=user, phone='0909000999').exists())

    def test_login_returns_user_profile(self):
        user = User.objects.create_user(
            username='test-cashier-login',
            password='Password123!',
            full_name='Cashier One',
            role=User.Role.CASHIER,
            branch=self.branch,
        )

        response = self.client.post(
            '/api/accounts/login/',
            {'username': user.username, 'password': 'Password123!'},
            format='json',
        )

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data['username'], 'cashier1')
        self.assertEqual(response.data['role'], User.Role.CASHIER)

    def test_me_requires_authentication(self):
        response = self.client.get('/api/accounts/me/')
        self.assertEqual(response.status_code, 403)


class PasswordChangeTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.branch = Branch.objects.create(
            code='TBR02',
            name='Test Central Branch 2',
            address='12 Nguyen Trai',
            phone='0901000001',
            status='active',
        )
        self.user = User.objects.create_user(
            username='test-admin-password-change',
            password='OldPassword123!',
            full_name='Admin User',
            role=User.Role.ADMIN,
            branch=self.branch,
        )
        self.client.force_authenticate(user=self.user)

    def test_change_password(self):
        response = self.client.post(
            reverse('change-password'),
            {
                'current_password': 'OldPassword123!',
                'new_password': 'NewPassword123!',
            },
            format='json',
        )

        self.assertEqual(response.status_code, 200)
        self.user.refresh_from_db()
        self.assertTrue(self.user.check_password('NewPassword123!'))

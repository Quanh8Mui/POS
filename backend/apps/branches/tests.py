from django.contrib.auth import get_user_model
from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APIClient

from .models import Branch

User = get_user_model()


class BranchApiTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.admin = User.objects.create_user(
            username='test-admin-branch',
            password='Password123!',
            full_name='Admin User',
            role=User.Role.ADMIN,
        )
        self.client.force_authenticate(user=self.admin)

    def test_create_branch(self):
        response = self.client.post(
            reverse('branch-list'),
            {
                'code': 'BR01',
                'name': 'Central Branch',
                'address': '12 Nguyen Trai',
                'phone': '0901000001',
                'status': 'active',
            },
            format='json',
        )

        self.assertEqual(response.status_code, 201)
        self.assertTrue(Branch.objects.filter(code='BR01').exists())

    def test_list_branches(self):
        Branch.objects.create(
            code='BR01',
            name='Central Branch',
            address='12 Nguyen Trai',
            phone='0901000001',
            status='active',
        )
        response = self.client.get(reverse('branch-list'))
        self.assertEqual(response.status_code, 200)
        self.assertGreaterEqual(len(response.data), 1)

from django.db import migrations
from django.contrib.auth.hashers import make_password


def seed_users(apps, schema_editor):
    User = apps.get_model('accounts', 'User')
    Branch = apps.get_model('branches', 'Branch')

    branch1 = Branch.objects.filter(code='BR01').first()
    branch2 = Branch.objects.filter(code='BR02').first()

    users = [
        ('admin', 'Admin User', 'admin', None),
        ('cashier1', 'Cashier One', 'cashier', branch1),
        ('cashier2', 'Cashier Two', 'cashier', branch2),
    ]

    for username, full_name, role, branch in users:
        User.objects.update_or_create(
            username=username,
            defaults={
                'full_name': full_name,
                'role': role,
                'branch': branch,
                'password': make_password('12345678'),
                'is_staff': role == 'admin',
                'is_superuser': role == 'admin',
                'is_active': True,
            },
        )


class Migration(migrations.Migration):

    dependencies = [
        ('accounts', '0001_initial'),
        ('branches', '0002_seed_demo'),
    ]

    operations = [
        migrations.RunPython(seed_users, migrations.RunPython.noop),
    ]

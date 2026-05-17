from django.db import migrations
from django.utils import timezone


def seed_branches(apps, schema_editor):
    Branch = apps.get_model('branches', 'Branch')
    Branch.objects.get_or_create(
        code='BR01',
        defaults={
            'name': 'Central Mini Mart',
            'address': '12 Nguyen Trai, District 1, Ho Chi Minh City',
            'phone': '0901000001',
            'status': 'active',
        },
    )
    Branch.objects.get_or_create(
        code='BR02',
        defaults={
            'name': 'North Mini Mart',
            'address': '88 Le Loi, District 3, Ho Chi Minh City',
            'phone': '0901000002',
            'status': 'active',
        },
    )


class Migration(migrations.Migration):

    dependencies = [
        ('branches', '0001_initial'),
    ]

    operations = [
        migrations.RunPython(seed_branches, migrations.RunPython.noop),
    ]

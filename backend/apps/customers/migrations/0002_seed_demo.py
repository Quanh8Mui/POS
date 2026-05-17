from django.db import migrations


def seed_customers(apps, schema_editor):
    Customer = apps.get_model('customers', 'Customer')
    Customer.objects.get_or_create(
        phone='0909000001',
        defaults={'full_name': 'Nguyen Van A', 'email': 'a@example.com', 'loyalty_points': 120},
    )
    Customer.objects.get_or_create(
        phone='0909000002',
        defaults={'full_name': 'Tran Thi B', 'email': 'b@example.com', 'loyalty_points': 55},
    )
    Customer.objects.get_or_create(
        phone='0909000003',
        defaults={'full_name': 'Le Van C', 'email': 'c@example.com', 'loyalty_points': 10},
    )


class Migration(migrations.Migration):

    dependencies = [
        ('customers', '0001_initial'),
    ]

    operations = [
        migrations.RunPython(seed_customers, migrations.RunPython.noop),
    ]

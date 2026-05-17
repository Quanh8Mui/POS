from django.db import migrations


def seed_catalog(apps, schema_editor):
    Category = apps.get_model('catalog', 'Category')
    Product = apps.get_model('catalog', 'Product')
    Inventory = apps.get_model('catalog', 'Inventory')
    Branch = apps.get_model('branches', 'Branch')

    beverages, _ = Category.objects.get_or_create(name='Beverages', defaults={'sort_order': 1, 'is_active': True})
    snacks, _ = Category.objects.get_or_create(name='Snacks', defaults={'sort_order': 2, 'is_active': True})
    household, _ = Category.objects.get_or_create(name='Household', defaults={'sort_order': 3, 'is_active': True})

    products = [
        ('SKU-0001', '893000000001', 'Mineral Water 500ml', beverages, 'bottle', 3000, 5000),
        ('SKU-0002', '893000000002', 'Orange Soda 330ml', beverages, 'can', 6000, 10000),
        ('SKU-0003', '893000000003', 'Instant Noodles Pack', snacks, 'pack', 2500, 4500),
        ('SKU-0004', '893000000004', 'Potato Chips 90g', snacks, 'bag', 8000, 12000),
        ('SKU-0005', '893000000005', 'Laundry Detergent 1kg', household, 'bag', 18000, 25000),
        ('SKU-0006', '893000000006', 'Shampoo 650ml', household, 'bottle', 32000, 45000),
    ]

    for sku, barcode, name, category, unit, cost, price in products:
        product, _ = Product.objects.get_or_create(
            sku=sku,
            defaults={
                'barcode': barcode,
                'name': name,
                'category': category,
                'unit': unit,
                'cost_price': cost,
                'sale_price': price,
                'is_active': True,
            },
        )

        for branch in Branch.objects.all():
            Inventory.objects.get_or_create(
                branch=branch,
                product=product,
                defaults={'quantity_on_hand': 50, 'reorder_level': 10},
            )


class Migration(migrations.Migration):

    dependencies = [
        ('branches', '0002_seed_demo'),
        ('catalog', '0001_initial'),
    ]

    operations = [
        migrations.RunPython(seed_catalog, migrations.RunPython.noop),
    ]

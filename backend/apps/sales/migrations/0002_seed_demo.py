from django.db import migrations
from django.utils import timezone


def seed_promotions(apps, schema_editor):
    Promotion = apps.get_model('sales', 'Promotion')
    now = timezone.now()
    Promotion.objects.get_or_create(
        name='Weekend 10% Off',
        defaults={
            'type': 'percent',
            'value': 10,
            'start_at': now,
            'end_at': now + timezone.timedelta(days=30),
            'is_active': True,
        },
    )
    Promotion.objects.get_or_create(
        name='15k Off Order',
        defaults={
            'type': 'fixed',
            'value': 15000,
            'start_at': now,
            'end_at': now + timezone.timedelta(days=30),
            'is_active': True,
        },
    )


class Migration(migrations.Migration):

    dependencies = [
        ('sales', '0001_initial'),
    ]

    operations = [
        migrations.RunPython(seed_promotions, migrations.RunPython.noop),
    ]

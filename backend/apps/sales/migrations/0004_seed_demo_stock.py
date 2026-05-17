from django.db import migrations


def noop_seed(apps, schema_editor):
    return


class Migration(migrations.Migration):

    dependencies = [
        ('sales', '0003_seed_demo_orders'),
    ]

    operations = [
        migrations.RunPython(noop_seed, migrations.RunPython.noop),
    ]

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('sales', '0005_seed_demo_loyalty'),
    ]

    operations = [
        migrations.CreateModel(
            name='PricingPolicy',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(default='Default policy', max_length=150)),
                ('vat_rate', models.DecimalField(decimal_places=2, default=10, max_digits=5)),
                ('is_active', models.BooleanField(default=True)),
                ('effective_from', models.DateTimeField(blank=True, null=True)),
                ('effective_to', models.DateTimeField(blank=True, null=True)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('global_promotion', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='pricing_policies', to='sales.promotion')),
            ],
        ),
        migrations.AddField(
            model_name='salesorder',
            name='pricing_policy',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='sales_orders', to='sales.pricingpolicy'),
        ),
    ]

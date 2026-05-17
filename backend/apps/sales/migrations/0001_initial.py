from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        ('accounts', '0001_initial'),
        ('branches', '0001_initial'),
        ('catalog', '0001_initial'),
        ('customers', '0001_initial'),
    ]

    operations = [
        migrations.CreateModel(
            name='Promotion',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=150)),
                ('type', models.CharField(choices=[('percent', 'Percent'), ('fixed', 'Fixed amount')], max_length=30)),
                ('value', models.DecimalField(decimal_places=2, max_digits=12)),
                ('start_at', models.DateTimeField()),
                ('end_at', models.DateTimeField()),
                ('is_active', models.BooleanField(default=True)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
            ],
        ),
        migrations.CreateModel(
            name='SalesOrder',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('order_code', models.CharField(max_length=30, unique=True)),
                ('subtotal', models.DecimalField(decimal_places=2, default=0, max_digits=12)),
                ('discount_amount', models.DecimalField(decimal_places=2, default=0, max_digits=12)),
                ('tax_amount', models.DecimalField(decimal_places=2, default=0, max_digits=12)),
                ('total_amount', models.DecimalField(decimal_places=2, default=0, max_digits=12)),
                ('payment_method', models.CharField(choices=[('cash', 'Cash'), ('card', 'Card'), ('mixed', 'Mixed')], max_length=30)),
                ('status', models.CharField(choices=[('completed', 'Completed'), ('void', 'Void'), ('draft', 'Draft')], default='completed', max_length=20)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('branch', models.ForeignKey(on_delete=django.db.models.deletion.PROTECT, related_name='sales_orders', to='branches.branch')),
                ('cashier', models.ForeignKey(on_delete=django.db.models.deletion.PROTECT, related_name='sales_orders', to='accounts.user')),
                ('customer', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='sales_orders', to='customers.customer')),
                ('promotion', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='sales_orders', to='sales.promotion')),
            ],
        ),
        migrations.CreateModel(
            name='LoyaltyTransaction',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('points_earned', models.IntegerField(default=0)),
                ('points_used', models.IntegerField(default=0)),
                ('balance_after', models.IntegerField()),
                ('transaction_type', models.CharField(choices=[('earn', 'Earn'), ('redeem', 'Redeem'), ('adjust', 'Adjust')], max_length=30)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('customer', models.ForeignKey(on_delete=django.db.models.deletion.PROTECT, related_name='loyalty_transactions', to='customers.customer')),
                ('sale_order', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='loyalty_transactions', to='sales.salesorder')),
            ],
        ),
        migrations.CreateModel(
            name='StockMovement',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('movement_type', models.CharField(choices=[('sale', 'Sale'), ('import', 'Import'), ('adjust', 'Adjust'), ('return', 'Return')], max_length=30)),
                ('quantity', models.IntegerField()),
                ('reference_type', models.CharField(blank=True, max_length=30)),
                ('reference_id', models.BigIntegerField(blank=True, null=True)),
                ('note', models.CharField(blank=True, max_length=255)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('branch', models.ForeignKey(on_delete=django.db.models.deletion.PROTECT, related_name='stock_movements', to='branches.branch')),
                ('created_by', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='stock_movements', to='accounts.user')),
                ('product', models.ForeignKey(on_delete=django.db.models.deletion.PROTECT, related_name='stock_movements', to='catalog.product')),
            ],
        ),
        migrations.CreateModel(
            name='SalesOrderItem',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('quantity', models.IntegerField()),
                ('unit_price', models.DecimalField(decimal_places=2, max_digits=12)),
                ('discount_amount', models.DecimalField(decimal_places=2, default=0, max_digits=12)),
                ('line_total', models.DecimalField(decimal_places=2, max_digits=12)),
                ('product', models.ForeignKey(on_delete=django.db.models.deletion.PROTECT, related_name='sale_items', to='catalog.product')),
                ('sale_order', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='items', to='sales.salesorder')),
            ],
        ),
    ]

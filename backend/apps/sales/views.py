from decimal import Decimal

from django.db import transaction
from django.db.models import F
from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from apps.catalog.models import Inventory, Product
from apps.customers.models import Customer
from .models import LoyaltyTransaction, Promotion, SalesOrder, SalesOrderItem, StockMovement
from .serializers import LoyaltyTransactionSerializer, PromotionSerializer, SalesOrderSerializer, StockMovementSerializer


class PromotionViewSet(viewsets.ModelViewSet):
    queryset = Promotion.objects.all()
    serializer_class = PromotionSerializer
    permission_classes = [IsAuthenticated]


class LoyaltyTransactionViewSet(viewsets.ModelViewSet):
    queryset = LoyaltyTransaction.objects.select_related('customer', 'sale_order').all()
    serializer_class = LoyaltyTransactionSerializer
    permission_classes = [IsAuthenticated]


class StockMovementViewSet(viewsets.ModelViewSet):
    queryset = StockMovement.objects.select_related('branch', 'product', 'created_by').all()
    serializer_class = StockMovementSerializer
    permission_classes = [IsAuthenticated]


class SalesOrderViewSet(viewsets.ModelViewSet):
    queryset = SalesOrder.objects.select_related('branch', 'cashier', 'customer', 'promotion').prefetch_related('items').all()
    serializer_class = SalesOrderSerializer
    permission_classes = [IsAuthenticated]

    @action(detail=False, methods=['post'])
    def create_sale(self, request):
        data = request.data
        items = data.get('items', [])
        if not items:
            return Response({'detail': 'items are required'}, status=status.HTTP_400_BAD_REQUEST)

        with transaction.atomic():
            order = SalesOrder.objects.create(
                order_code=data['order_code'],
                branch_id=data['branch_id'],
                cashier_id=data['cashier_id'],
                customer_id=data.get('customer_id'),
                promotion_id=data.get('promotion_id'),
                subtotal=Decimal('0'),
                discount_amount=Decimal(str(data.get('discount_amount', 0))),
                tax_amount=Decimal(str(data.get('tax_amount', 0))),
                total_amount=Decimal(str(data.get('total_amount', 0))),
                payment_method=data['payment_method'],
                status=data.get('status', SalesOrder.Status.COMPLETED),
            )

            subtotal = Decimal('0')
            for item in items:
                product = Product.objects.get(pk=item['product_id'])
                qty = int(item['quantity'])
                unit_price = Decimal(str(item.get('unit_price', product.sale_price)))
                discount_amount = Decimal(str(item.get('discount_amount', 0)))
                line_total = (unit_price * qty) - discount_amount
                subtotal += unit_price * qty
                SalesOrderItem.objects.create(
                    sale_order=order,
                    product=product,
                    quantity=qty,
                    unit_price=unit_price,
                    discount_amount=discount_amount,
                    line_total=line_total,
                )

                inventory = Inventory.objects.select_for_update().get(branch_id=order.branch_id, product_id=product.id)
                if inventory.quantity_on_hand < qty:
                    return Response({'detail': f'Not enough stock for {product.name}'}, status=status.HTTP_400_BAD_REQUEST)
                inventory.quantity_on_hand = F('quantity_on_hand') - qty
                inventory.save(update_fields=['quantity_on_hand', 'updated_at'])
                inventory.refresh_from_db()

                StockMovement.objects.create(
                    branch_id=order.branch_id,
                    product=product,
                    movement_type=StockMovement.MovementType.SALE,
                    quantity=-qty,
                    reference_type='sales_order',
                    reference_id=order.id,
                    created_by_id=order.cashier_id,
                )

            order.subtotal = subtotal
            if not data.get('total_amount'):
                order.total_amount = subtotal - order.discount_amount + order.tax_amount
            order.save(update_fields=['subtotal', 'total_amount', 'discount_amount', 'tax_amount'])

            customer_id = data.get('customer_id')
            if customer_id:
                points_earned = int(order.total_amount // Decimal('10000'))
                customer = Customer.objects.select_for_update().get(pk=customer_id)
                customer.loyalty_points += points_earned
                customer.save(update_fields=['loyalty_points', 'updated_at'])
                LoyaltyTransaction.objects.create(
                    customer=customer,
                    sale_order=order,
                    points_earned=points_earned,
                    points_used=0,
                    balance_after=customer.loyalty_points,
                    transaction_type=LoyaltyTransaction.TransactionType.EARN,
                )

        return Response(SalesOrderSerializer(order).data, status=status.HTTP_201_CREATED)

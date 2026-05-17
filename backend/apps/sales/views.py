from decimal import Decimal

from django.db import transaction
from django.utils import timezone
from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from apps.catalog.models import Inventory, Product
from apps.customers.models import Customer
from .models import LoyaltyTransaction, PricingPolicy, Promotion, SalesOrder, SalesOrderItem, StockMovement
from .serializers import LoyaltyTransactionSerializer, PricingPolicySerializer, PromotionSerializer, SalesOrderSerializer, StockMovementSerializer


class PricingPolicyViewSet(viewsets.ModelViewSet):
    queryset = PricingPolicy.objects.select_related('global_promotion').all()
    serializer_class = PricingPolicySerializer
    permission_classes = [IsAuthenticated]

    @action(detail=False, methods=['get'])
    def active(self, request):
        policy = self.get_queryset().filter(is_active=True).order_by('-updated_at').first()
        if not policy:
            policy = PricingPolicy.objects.create(name='Default policy', vat_rate=Decimal('10.00'), is_active=True)
        return Response(self.get_serializer(policy).data)


class PromotionViewSet(viewsets.ModelViewSet):
    queryset = Promotion.objects.all()
    serializer_class = PromotionSerializer
    permission_classes = [IsAuthenticated]

    @action(detail=False, methods=['get'])
    def active(self, request):
        now = timezone.now()
        queryset = self.get_queryset().filter(is_active=True, start_at__lte=now, end_at__gte=now)
        return Response(self.get_serializer(queryset, many=True).data)


class LoyaltyTransactionViewSet(viewsets.ModelViewSet):
    queryset = LoyaltyTransaction.objects.select_related('customer', 'sale_order').all()
    serializer_class = LoyaltyTransactionSerializer
    permission_classes = [IsAuthenticated]


class StockMovementViewSet(viewsets.ModelViewSet):
    queryset = StockMovement.objects.select_related('branch', 'product', 'created_by').all()
    serializer_class = StockMovementSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        movement = serializer.save()
        inventory, _ = Inventory.objects.get_or_create(branch=movement.branch, product=movement.product)
        inventory.quantity_on_hand = max(inventory.quantity_on_hand + movement.quantity, 0)
        inventory.save(update_fields=['quantity_on_hand', 'updated_at'])


class SalesOrderViewSet(viewsets.ModelViewSet):
    queryset = SalesOrder.objects.select_related('branch', 'cashier', 'customer', 'promotion', 'pricing_policy').prefetch_related('items').all()
    serializer_class = SalesOrderSerializer
    permission_classes = [IsAuthenticated]

    @action(detail=True, methods=['get'])
    def detail(self, request, pk=None):
        order = self.get_object()
        return Response(SalesOrderSerializer(order).data)

    @action(detail=False, methods=['post'])
    def create_sale(self, request):
        data = request.data
        items = data.get('items', [])
        if not items:
            return Response({'detail': 'items are required'}, status=status.HTTP_400_BAD_REQUEST)

        policy = PricingPolicy.objects.filter(is_active=True).order_by('-updated_at').first()
        vat_rate = Decimal(str(data.get('vat_rate', policy.vat_rate if policy else 10)))
        promo_id = data.get('promotion_id') or (policy.global_promotion_id if policy and policy.global_promotion_id else None)

        with transaction.atomic():
            order = SalesOrder.objects.create(
                order_code=data['order_code'],
                branch_id=data['branch_id'],
                cashier_id=data['cashier_id'],
                customer_id=data.get('customer_id'),
                promotion_id=promo_id,
                pricing_policy=policy,
                subtotal=Decimal('0'),
                discount_amount=Decimal(str(data.get('discount_amount', 0))),
                tax_amount=Decimal('0'),
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
                inventory.quantity_on_hand -= qty
                inventory.save(update_fields=['quantity_on_hand', 'updated_at'])

                StockMovement.objects.create(
                    branch_id=order.branch_id,
                    product=product,
                    movement_type=StockMovement.MovementType.SALE,
                    quantity=-qty,
                    reference_type='sales_order',
                    reference_id=order.id,
                    created_by_id=order.cashier_id,
                )

            promo_discount = Decimal('0')
            if policy and policy.global_promotion_id and policy.global_promotion:
                promo = policy.global_promotion
                if promo.type == Promotion.PromotionType.PERCENT:
                    promo_discount = subtotal * (promo.value / Decimal('100'))
                else:
                    promo_discount = promo.value

            vat_amount = (subtotal - promo_discount - order.discount_amount) * (vat_rate / Decimal('100'))
            order.subtotal = subtotal
            order.tax_amount = vat_amount
            order.total_amount = max(subtotal - promo_discount - order.discount_amount + vat_amount, Decimal('0'))
            order.save(update_fields=['subtotal', 'total_amount', 'discount_amount', 'tax_amount', 'promotion', 'pricing_policy'])

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

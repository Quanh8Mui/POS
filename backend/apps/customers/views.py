from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from apps.sales.models import LoyaltyTransaction, SalesOrder
from apps.sales.serializers import LoyaltyTransactionSerializer, SalesOrderSerializer
from .models import Customer
from .serializers import CustomerSerializer


class CustomerViewSet(viewsets.ModelViewSet):
    queryset = Customer.objects.select_related('user').all()
    serializer_class = CustomerSerializer
    permission_classes = [IsAuthenticated]

    @action(detail=True, methods=['get'])
    def profile(self, request, pk=None):
        customer = self.get_object()
        return Response(CustomerSerializer(customer).data)

    @action(detail=True, methods=['get'])
    def orders(self, request, pk=None):
        orders = SalesOrder.objects.filter(customer_id=pk).prefetch_related('items').order_by('-created_at')
        return Response(SalesOrderSerializer(orders, many=True).data)

    @action(detail=True, methods=['get'])
    def loyalty(self, request, pk=None):
        transactions = LoyaltyTransaction.objects.filter(customer_id=pk).order_by('-created_at')
        return Response(LoyaltyTransactionSerializer(transactions, many=True).data)

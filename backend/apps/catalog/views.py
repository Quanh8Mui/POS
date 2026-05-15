from django.db import models
from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated

from .models import Category, Inventory, Product
from .serializers import CategorySerializer, InventorySerializer, ProductSerializer


class CategoryViewSet(viewsets.ModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [IsAuthenticated]


class ProductViewSet(viewsets.ModelViewSet):
    queryset = Product.objects.select_related('category').all()
    serializer_class = ProductSerializer
    permission_classes = [IsAuthenticated]


class InventoryViewSet(viewsets.ModelViewSet):
    queryset = Inventory.objects.select_related('branch', 'product').all()
    serializer_class = InventorySerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        queryset = super().get_queryset()
        branch_id = self.request.query_params.get('branch_id')
        low_stock = self.request.query_params.get('low_stock')
        if branch_id:
            queryset = queryset.filter(branch_id=branch_id)
        if low_stock in {'1', 'true', 'True'}:
            queryset = queryset.filter(quantity_on_hand__lte=models.F('reorder_level'))
        return queryset

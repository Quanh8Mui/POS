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

    def get_queryset(self):
        queryset = super().get_queryset()
        category_id = self.request.query_params.get('category_id')
        search = self.request.query_params.get('search')
        if category_id:
            queryset = queryset.filter(category_id=category_id)
        if search:
            queryset = queryset.filter(
                models.Q(name__icontains=search)
                | models.Q(sku__icontains=search)
                | models.Q(barcode__icontains=search)
            )
        return queryset


class InventoryViewSet(viewsets.ModelViewSet):
    queryset = Inventory.objects.select_related('branch', 'product').all()
    serializer_class = InventorySerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        queryset = super().get_queryset()
        branch_id = self.request.query_params.get('branch_id')
        if branch_id:
            queryset = queryset.filter(branch_id=branch_id)
        low_stock = self.request.query_params.get('low_stock')
        if low_stock == 'true':
            queryset = queryset.filter(quantity_on_hand__lte=models.F('reorder_level'))
        return queryset

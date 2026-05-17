from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import LoyaltyTransactionViewSet, PricingPolicyViewSet, PromotionViewSet, SalesOrderViewSet, StockMovementViewSet

router = DefaultRouter()
router.register(r'pricing-policies', PricingPolicyViewSet, basename='pricing-policy')
router.register(r'promotions', PromotionViewSet, basename='promotion')
router.register(r'orders', SalesOrderViewSet, basename='sales-order')
router.register(r'loyalty', LoyaltyTransactionViewSet, basename='loyalty-transaction')
router.register(r'stock-movements', StockMovementViewSet, basename='stock-movement')

urlpatterns = [
    path('', include(router.urls)),
]

from django.contrib import admin
from django.urls import include, path
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView, SpectacularRedocView

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/schema/', SpectacularAPIView.as_view(), name='schema'),
    path('api/docs/', SpectacularSwaggerView.as_view(url_name='schema'), name='swagger-ui'),
    path('api/redoc/', SpectacularRedocView.as_view(url_name='schema'), name='redoc'),
    path('api/accounts/', include('apps.accounts.urls')),
    path('api/branches/', include('apps.branches.urls')),
    path('api/catalog/', include('apps.catalog.urls')),
    path('api/customers/', include('apps.customers.urls')),
    path('api/sales/', include('apps.sales.urls')),
]

from django.contrib import admin
from django.urls import include, path

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/accounts/', include('apps.accounts.urls')),
    path('api/branches/', include('apps.branches.urls')),
    path('api/catalog/', include('apps.catalog.urls')),
    path('api/customers/', include('apps.customers.urls')),
    path('api/sales/', include('apps.sales.urls')),
]

from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as DjangoUserAdmin

from .models import User


@admin.register(User)
class UserAdmin(DjangoUserAdmin):
    fieldsets = DjangoUserAdmin.fieldsets + (
        ('POS fields', {'fields': ('full_name', 'role', 'branch')}),
    )
    list_display = ('username', 'full_name', 'role', 'branch', 'is_active')
    list_filter = ('role', 'is_active')
    search_fields = ('username', 'full_name')

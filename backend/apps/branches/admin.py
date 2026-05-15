from django.contrib import admin

from .models import Branch


@admin.register(Branch)
class BranchAdmin(admin.ModelAdmin):
    list_display = ('code', 'name', 'status', 'phone')
    search_fields = ('code', 'name', 'address')
    list_filter = ('status',)

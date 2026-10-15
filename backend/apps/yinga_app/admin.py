from django.contrib import admin
from unfold.admin import ModelAdmin
from .models import SupportMessage

@admin.register(SupportMessage)
class SupportMessageAdmin(ModelAdmin):
    list_display = ('subject', 'name', 'email', 'category', 'status', 'created_at')
    list_filter = ('status', 'category', 'created_at')
    search_fields = ('name', 'email', 'subject', 'message', 'admin_notes')
    readonly_fields = ('id', 'created_at', 'updated_at')
    fieldsets = (
        (None, {
            'fields': ('id', 'status', 'user', 'name', 'email', 'category', 'subject', 'message')
        }),
        ('Administration', {
            'fields': ('admin_notes', 'created_at', 'updated_at')
        }),
    )

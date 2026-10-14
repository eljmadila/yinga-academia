from django.contrib import admin
from unfold.admin import ModelAdmin

from .models import Progress


class ProgressAdmin(ModelAdmin):
    list_display = ('student', 'lesson', 'is_completed', 'last_accessed_at')
    list_filter = ('is_completed',)
    search_fields = ('student__email', 'lesson__title')
    list_per_page = 25

admin.site.register(Progress, ProgressAdmin)

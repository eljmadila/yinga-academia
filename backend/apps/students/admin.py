from django.contrib import admin
from unfold.admin import ModelAdmin

from .models import Enrollment

class EnrollmentAdmin(ModelAdmin):
    list_display = ('student', 'course', 'status', 'enrolled_at')
    list_filter = ('status',)
    search_fields = ('student__email', 'course__title')
    list_per_page = 25

admin.site.register(Enrollment, EnrollmentAdmin)

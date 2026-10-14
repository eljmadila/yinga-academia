from django.contrib import admin
from unfold.admin import ModelAdmin
from .models import Order, Payment

class OrderAdmin(ModelAdmin):
    list_display = ('id', 'student', 'course', 'amount', 'status', 'created_at')
    list_filter = ('status',)
    search_fields = ('student__email', 'course__title', 'id')
    list_per_page = 25

class PaymentAdmin(ModelAdmin):
    list_display = ('payment_reference', 'order', 'payment_method', 'amount', 'currency', 'status', 'created_at')
    list_filter = ('payment_method', 'status')
    search_fields = ('payment_reference', 'transaction_id', 'order__student__email')
    list_per_page = 25

admin.site.register(Order, OrderAdmin)
admin.site.register(Payment, PaymentAdmin)

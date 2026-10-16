from django.urls import path
from . import views

urlpatterns = [
    path('orders/<uuid:order_id>/', views.order_status, name='order_status'),
    path('mpesa/stk-push/', views.mpesa_stk_push, name='mpesa_stk_push'),
    path('mpesa/webhook/', views.mpesa_webhook, name='mpesa_webhook'),
    path('flutterwave/checkout/', views.flutterwave_checkout, name='flutterwave_checkout'),
    path('flutterwave/webhook/', views.flutterwave_webhook, name='flutterwave_webhook'),
    path('paystack/initialize/', views.paystack_initialize, name='paystack_initialize'),
    path('paystack/verify/<str:reference>/', views.paystack_verify, name='paystack_verify'),
    path('paystack/webhook/', views.paystack_webhook, name='paystack_webhook'),
]

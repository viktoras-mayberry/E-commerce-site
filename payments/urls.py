from django.urls import path
from . import views

urlpatterns = [
    # Payments
    path('', views.PaymentListView.as_view(), name='payment-list'),
    path('<str:payment_id>/', views.PaymentDetailView.as_view(), name='payment-detail'),
    path('stats/', views.payment_stats, name='payment-stats'),
    
    # Paystack
    path('paystack/initialize/', views.initialize_paystack_payment, name='paystack-initialize'),
    path('paystack/verify/', views.verify_paystack_payment, name='paystack-verify'),
]

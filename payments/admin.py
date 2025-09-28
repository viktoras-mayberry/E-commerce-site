from django.contrib import admin
from .models import Payment, PaystackTransaction


@admin.register(Payment)
class PaymentAdmin(admin.ModelAdmin):
    list_display = [
        'payment_id', 'order', 'amount', 'currency', 'payment_method',
        'status', 'gateway_reference', 'created_at'
    ]
    list_filter = ['status', 'payment_method', 'currency', 'created_at']
    search_fields = ['payment_id', 'order__order_number', 'gateway_reference']
    readonly_fields = ['payment_id', 'created_at', 'updated_at', 'paid_at', 'refunded_at']
    
    fieldsets = (
        ('Payment Information', {
            'fields': ('payment_id', 'order', 'amount', 'currency', 'payment_method', 'status')
        }),
        ('Gateway Information', {
            'fields': ('gateway_reference', 'gateway_response')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at', 'paid_at', 'refunded_at')
        }),
        ('Failure/Refund Information', {
            'fields': ('failure_reason', 'refund_amount', 'refund_reason'),
            'classes': ('collapse',)
        }),
    )


@admin.register(PaystackTransaction)
class PaystackTransactionAdmin(admin.ModelAdmin):
    list_display = [
        'paystack_reference', 'payment', 'customer_email', 'amount',
        'currency', 'status', 'created_at'
    ]
    list_filter = ['status', 'currency', 'created_at']
    search_fields = ['paystack_reference', 'payment__payment_id', 'customer_email']
    readonly_fields = ['created_at', 'updated_at']

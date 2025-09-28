from rest_framework import generics, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django.conf import settings
from django.http import JsonResponse
import requests
import json
from .models import Payment, PaystackTransaction
from .serializers import (
    PaymentSerializer, PaymentCreateSerializer, PaystackInitializeSerializer,
    PaystackCallbackSerializer, PaystackTransactionSerializer
)
from orders.models import Order


class PaymentListView(generics.ListAPIView):
    """List payments (Admin only)"""
    queryset = Payment.objects.all().select_related('order')
    serializer_class = PaymentSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        # Only admins can view all payments
        if not self.request.user.is_admin:
            return Payment.objects.none()
        return super().get_queryset()


class PaymentDetailView(generics.RetrieveAPIView):
    """Get payment details"""
    queryset = Payment.objects.all().select_related('order')
    serializer_class = PaymentSerializer
    permission_classes = [IsAuthenticated]
    lookup_field = 'payment_id'

    def get_queryset(self):
        # Admins can view all payments, others can only view their own
        if self.request.user.is_admin:
            return Payment.objects.all()
        return Payment.objects.filter(order__customer_email=self.request.user.email)


@api_view(['POST'])
@permission_classes([AllowAny])
def initialize_paystack_payment(request):
    """Initialize Paystack payment"""
    serializer = PaystackInitializeSerializer(data=request.data)
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    data = serializer.validated_data
    
    # Get order
    try:
        order = Order.objects.get(order_number=data['order_number'])
    except Order.DoesNotExist:
        return Response({'error': 'Order not found'}, status=status.HTTP_404_NOT_FOUND)
    
    # Create payment record
    payment = Payment.objects.create(
        order=order,
        amount=data['amount'],
        currency=data['currency'],
        payment_method='paystack'
    )
    
    # Initialize Paystack payment
    paystack_url = "https://api.paystack.co/transaction/initialize"
    headers = {
        "Authorization": f"Bearer {settings.PAYSTACK_SECRET_KEY}",
        "Content-Type": "application/json"
    }
    
    payload = {
        "email": data['email'],
        "amount": int(data['amount'] * 100),  # Convert to kobo
        "reference": payment.payment_id,
        "callback_url": data.get('callback_url', ''),
        "metadata": {
            "order_number": order.order_number,
            "payment_id": payment.payment_id,
            **data.get('metadata', {})
        }
    }
    
    try:
        response = requests.post(paystack_url, headers=headers, data=json.dumps(payload))
        response_data = response.json()
        
        if response_data.get('status'):
            # Update payment with gateway reference
            payment.gateway_reference = response_data['data']['reference']
            payment.gateway_response = response_data
            payment.save()
            
            return Response({
                'payment_id': payment.payment_id,
                'authorization_url': response_data['data']['authorization_url'],
                'access_code': response_data['data']['access_code'],
                'reference': response_data['data']['reference']
            })
        else:
            payment.status = 'failed'
            payment.failure_reason = response_data.get('message', 'Payment initialization failed')
            payment.save()
            
            return Response({
                'error': response_data.get('message', 'Payment initialization failed')
            }, status=status.HTTP_400_BAD_REQUEST)
            
    except requests.RequestException as e:
        payment.status = 'failed'
        payment.failure_reason = str(e)
        payment.save()
        
        return Response({
            'error': 'Payment service unavailable'
        }, status=status.HTTP_503_SERVICE_UNAVAILABLE)


@api_view(['POST'])
@permission_classes([AllowAny])
def verify_paystack_payment(request):
    """Verify Paystack payment"""
    reference = request.data.get('reference')
    if not reference:
        return Response({'error': 'Reference is required'}, status=status.HTTP_400_BAD_REQUEST)
    
    # Get payment
    try:
        payment = Payment.objects.get(gateway_reference=reference)
    except Payment.DoesNotExist:
        return Response({'error': 'Payment not found'}, status=status.HTTP_404_NOT_FOUND)
    
    # Verify with Paystack
    paystack_url = f"https://api.paystack.co/transaction/verify/{reference}"
    headers = {
        "Authorization": f"Bearer {settings.PAYSTACK_SECRET_KEY}",
        "Content-Type": "application/json"
    }
    
    try:
        response = requests.get(paystack_url, headers=headers)
        response_data = response.json()
        
        if response_data.get('status'):
            transaction_data = response_data['data']
            
            # Update payment status
            if transaction_data['status'] == 'success':
                payment.status = 'completed'
                payment.paid_at = transaction_data['paid_at']
                payment.order.payment_status = 'paid'
                payment.order.payment_verified = True
                payment.order.save()
            else:
                payment.status = 'failed'
                payment.failure_reason = transaction_data.get('gateway_response', 'Payment failed')
            
            # Create or update Paystack transaction record
            paystack_transaction, created = PaystackTransaction.objects.get_or_create(
                payment=payment,
                defaults={
                    'paystack_reference': reference,
                    'paystack_transaction_id': transaction_data.get('id'),
                    'authorization_code': transaction_data.get('authorization', {}).get('authorization_code'),
                    'customer_email': transaction_data.get('customer', {}).get('email'),
                    'customer_code': transaction_data.get('customer', {}).get('customer_code'),
                    'amount': transaction_data['amount'] / 100,  # Convert from kobo
                    'currency': transaction_data['currency'],
                    'status': transaction_data['status'],
                    'gateway_response': transaction_data
                }
            )
            
            if not created:
                paystack_transaction.status = transaction_data['status']
                paystack_transaction.gateway_response = transaction_data
                paystack_transaction.save()
            
            payment.gateway_response = response_data
            payment.save()
            
            return Response({
                'payment_id': payment.payment_id,
                'status': payment.status,
                'amount': payment.amount,
                'order_number': payment.order.order_number,
                'paid_at': payment.paid_at
            })
        else:
            payment.status = 'failed'
            payment.failure_reason = response_data.get('message', 'Payment verification failed')
            payment.save()
            
            return Response({
                'error': response_data.get('message', 'Payment verification failed')
            }, status=status.HTTP_400_BAD_REQUEST)
            
    except requests.RequestException as e:
        return Response({
            'error': 'Payment verification service unavailable'
        }, status=status.HTTP_503_SERVICE_UNAVAILABLE)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def payment_stats(request):
    """Get payment statistics (Admin only)"""
    if not request.user.is_admin:
        return Response({'error': 'Access denied'}, status=status.HTTP_403_FORBIDDEN)
    
    from django.db.models import Sum, Count
    
    total_payments = Payment.objects.count()
    completed_payments = Payment.objects.filter(status='completed').count()
    pending_payments = Payment.objects.filter(status='pending').count()
    failed_payments = Payment.objects.filter(status='failed').count()
    
    # Calculate total revenue
    total_revenue = Payment.objects.filter(
        status='completed'
    ).aggregate(total=Sum('amount'))['total'] or 0
    
    # Payment method breakdown
    paystack_payments = Payment.objects.filter(payment_method='paystack').count()
    bank_transfer_payments = Payment.objects.filter(payment_method='bank_transfer').count()
    cod_payments = Payment.objects.filter(payment_method='cash_on_delivery').count()
    
    return Response({
        'total_payments': total_payments,
        'completed_payments': completed_payments,
        'pending_payments': pending_payments,
        'failed_payments': failed_payments,
        'total_revenue': float(total_revenue),
        'paystack_payments': paystack_payments,
        'bank_transfer_payments': bank_transfer_payments,
        'cod_payments': cod_payments
    })

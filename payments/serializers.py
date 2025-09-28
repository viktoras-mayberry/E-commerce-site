from rest_framework import serializers
from .models import Payment, PaystackTransaction
from orders.serializers import OrderSerializer


class PaymentSerializer(serializers.ModelSerializer):
    order = OrderSerializer(read_only=True)
    
    class Meta:
        model = Payment
        fields = [
            'id', 'payment_id', 'order', 'amount', 'currency', 'payment_method',
            'status', 'gateway_reference', 'gateway_response', 'created_at',
            'updated_at', 'paid_at', 'failure_reason', 'refund_amount',
            'refund_reason', 'refunded_at'
        ]
        read_only_fields = ['id', 'payment_id', 'created_at', 'updated_at']


class PaystackTransactionSerializer(serializers.ModelSerializer):
    class Meta:
        model = PaystackTransaction
        fields = [
            'id', 'paystack_reference', 'paystack_transaction_id', 'authorization_code',
            'customer_email', 'customer_code', 'amount', 'currency', 'status',
            'gateway_response', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class PaymentCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating payments"""
    
    class Meta:
        model = Payment
        fields = ['order', 'amount', 'currency', 'payment_method']

    def create(self, validated_data):
        # Set payment ID
        import uuid
        validated_data['payment_id'] = f"PAY-{uuid.uuid4().hex[:8].upper()}"
        return super().create(validated_data)


class PaystackInitializeSerializer(serializers.Serializer):
    """Serializer for Paystack payment initialization"""
    order_number = serializers.CharField()
    email = serializers.EmailField()
    amount = serializers.DecimalField(max_digits=10, decimal_places=2)
    callback_url = serializers.URLField(required=False)
    metadata = serializers.JSONField(required=False)

    def validate_amount(self, value):
        if value <= 0:
            raise serializers.ValidationError("Amount must be greater than 0")
        return value


class PaystackCallbackSerializer(serializers.Serializer):
    """Serializer for Paystack callback verification"""
    reference = serializers.CharField()
    status = serializers.CharField()
    transaction_id = serializers.CharField(required=False)
    authorization_code = serializers.CharField(required=False)
    customer_email = serializers.EmailField(required=False)
    amount = serializers.DecimalField(max_digits=10, decimal_places=2, required=False)
    currency = serializers.CharField(required=False)

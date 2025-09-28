from rest_framework import serializers
from .models import Order, OrderItem, Cart, CartItem
from products.serializers import ProductListSerializer


class OrderItemSerializer(serializers.ModelSerializer):
    product = ProductListSerializer(read_only=True)
    
    class Meta:
        model = OrderItem
        fields = [
            'id', 'product', 'product_name', 'product_sku', 'quantity',
            'unit_price', 'total_price', 'variation_name', 'variation_value'
        ]


class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)
    
    class Meta:
        model = Order
        fields = [
            'id', 'order_number', 'customer_name', 'customer_email', 'customer_phone',
            'customer_whatsapp', 'shipping_address', 'shipping_city', 'shipping_state',
            'shipping_zip', 'shipping_country', 'subtotal', 'shipping_cost', 'total_amount',
            'status', 'payment_status', 'payment_method', 'payment_reference',
            'payment_verified', 'notes', 'admin_notes', 'items', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'order_number', 'created_at', 'updated_at']


class OrderCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating orders"""
    items = serializers.ListField(
        child=serializers.DictField(),
        write_only=True
    )
    
    class Meta:
        model = Order
        fields = [
            'customer_name', 'customer_email', 'customer_phone', 'customer_whatsapp',
            'shipping_address', 'shipping_city', 'shipping_state', 'shipping_zip',
            'shipping_country', 'subtotal', 'shipping_cost', 'total_amount',
            'payment_method', 'notes', 'items'
        ]

    def create(self, validated_data):
        items_data = validated_data.pop('items', [])
        order = Order.objects.create(**validated_data)
        
        # Create order items
        for item_data in items_data:
            OrderItem.objects.create(order=order, **item_data)
        
        return order


class CartItemSerializer(serializers.ModelSerializer):
    product = ProductListSerializer(read_only=True)
    total_price = serializers.ReadOnlyField()
    
    class Meta:
        model = CartItem
        fields = [
            'id', 'product', 'quantity', 'variation_name', 'variation_value',
            'total_price', 'created_at', 'updated_at'
        ]


class CartSerializer(serializers.ModelSerializer):
    items = CartItemSerializer(many=True, read_only=True)
    total_items = serializers.SerializerMethodField()
    total_amount = serializers.SerializerMethodField()
    
    class Meta:
        model = Cart
        fields = ['id', 'session_key', 'items', 'total_items', 'total_amount', 'created_at', 'updated_at']
        read_only_fields = ['id', 'session_key', 'created_at', 'updated_at']

    def get_total_items(self, obj):
        return sum(item.quantity for item in obj.items.all())

    def get_total_amount(self, obj):
        return sum(item.total_price for item in obj.items.all())


class CartItemCreateSerializer(serializers.ModelSerializer):
    """Serializer for adding items to cart"""
    
    class Meta:
        model = CartItem
        fields = ['product', 'quantity', 'variation_name', 'variation_value']

    def create(self, validated_data):
        cart = self.context['cart']
        product = validated_data['product']
        quantity = validated_data['quantity']
        variation_name = validated_data.get('variation_name')
        variation_value = validated_data.get('variation_value')
        
        # Check if item already exists in cart
        existing_item = CartItem.objects.filter(
            cart=cart,
            product=product,
            variation_name=variation_name,
            variation_value=variation_value
        ).first()
        
        if existing_item:
            existing_item.quantity += quantity
            existing_item.save()
            return existing_item
        else:
            return CartItem.objects.create(cart=cart, **validated_data)

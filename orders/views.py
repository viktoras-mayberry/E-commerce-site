from rest_framework import generics, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django.db import transaction
from .models import Order, OrderItem, Cart, CartItem
from .serializers import (
    OrderSerializer, OrderCreateSerializer, CartSerializer, 
    CartItemSerializer, CartItemCreateSerializer
)


class OrderListView(generics.ListAPIView):
    """List orders (Admin only)"""
    queryset = Order.objects.all().prefetch_related('items__product')
    serializer_class = OrderSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        # Only admins can view all orders
        if not self.request.user.is_admin:
            return Order.objects.none()
        return super().get_queryset()


class OrderDetailView(generics.RetrieveAPIView):
    """Get order details"""
    queryset = Order.objects.all().prefetch_related('items__product')
    serializer_class = OrderSerializer
    permission_classes = [IsAuthenticated]
    lookup_field = 'order_number'

    def get_queryset(self):
        # Admins can view all orders, others can only view their own
        if self.request.user.is_admin:
            return Order.objects.all()
        return Order.objects.filter(customer_email=self.request.user.email)


class OrderCreateView(generics.CreateAPIView):
    """Create new order"""
    serializer_class = OrderCreateSerializer
    permission_classes = [AllowAny]

    @transaction.atomic
    def perform_create(self, serializer):
        order = serializer.save()
        
        # Update product stock quantities
        for item in order.items.all():
            product = item.product
            if product.stock_quantity >= item.quantity:
                product.stock_quantity -= item.quantity
                product.save()
            else:
                raise ValueError(f"Insufficient stock for {product.name}")


class OrderUpdateView(generics.UpdateAPIView):
    """Update order (Admin only)"""
    queryset = Order.objects.all()
    serializer_class = OrderSerializer
    permission_classes = [IsAuthenticated]
    lookup_field = 'order_number'

    def perform_update(self, serializer):
        # Only admins can update orders
        if not self.request.user.is_admin:
            raise PermissionError("Only admins can update orders")
        serializer.save()


# Cart Views
class CartView(generics.RetrieveAPIView):
    """Get or create cart"""
    serializer_class = CartSerializer
    permission_classes = [AllowAny]

    def get_object(self):
        session_key = self.request.session.session_key
        if not session_key:
            self.request.session.create()
            session_key = self.request.session.session_key
        
        cart, created = Cart.objects.get_or_create(session_key=session_key)
        return cart


class CartItemCreateView(generics.CreateAPIView):
    """Add item to cart"""
    serializer_class = CartItemCreateSerializer
    permission_classes = [AllowAny]

    def perform_create(self, serializer):
        session_key = self.request.session.session_key
        if not session_key:
            self.request.session.create()
            session_key = self.request.session.session_key
        
        cart, created = Cart.objects.get_or_create(session_key=session_key)
        serializer.save(cart=cart)


class CartItemUpdateView(generics.UpdateAPIView):
    """Update cart item quantity"""
    serializer_class = CartItemSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        session_key = self.request.session.session_key
        if not session_key:
            return CartItem.objects.none()
        
        try:
            cart = Cart.objects.get(session_key=session_key)
            return cart.items.all()
        except Cart.DoesNotExist:
            return CartItem.objects.none()


class CartItemDeleteView(generics.DestroyAPIView):
    """Remove item from cart"""
    permission_classes = [AllowAny]

    def get_queryset(self):
        session_key = self.request.session.session_key
        if not session_key:
            return CartItem.objects.none()
        
        try:
            cart = Cart.objects.get(session_key=session_key)
            return cart.items.all()
        except Cart.DoesNotExist:
            return CartItem.objects.none()


@api_view(['POST'])
@permission_classes([AllowAny])
def clear_cart(request):
    """Clear all items from cart"""
    session_key = request.session.session_key
    if not session_key:
        return Response({'message': 'No cart found'})
    
    try:
        cart = Cart.objects.get(session_key=session_key)
        cart.items.all().delete()
        return Response({'message': 'Cart cleared successfully'})
    except Cart.DoesNotExist:
        return Response({'message': 'No cart found'})


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def order_stats(request):
    """Get order statistics (Admin only)"""
    if not request.user.is_admin:
        return Response({'error': 'Access denied'}, status=status.HTTP_403_FORBIDDEN)
    
    total_orders = Order.objects.count()
    pending_orders = Order.objects.filter(status='pending').count()
    processing_orders = Order.objects.filter(status='processing').count()
    shipped_orders = Order.objects.filter(status='shipped').count()
    delivered_orders = Order.objects.filter(status='delivered').count()
    cancelled_orders = Order.objects.filter(status='cancelled').count()
    
    # Calculate total revenue
    from django.db.models import Sum
    total_revenue = Order.objects.filter(
        payment_status='paid'
    ).aggregate(total=Sum('total_amount'))['total'] or 0
    
    return Response({
        'total_orders': total_orders,
        'pending_orders': pending_orders,
        'processing_orders': processing_orders,
        'shipped_orders': shipped_orders,
        'delivered_orders': delivered_orders,
        'cancelled_orders': cancelled_orders,
        'total_revenue': float(total_revenue)
    })


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def cart_stats(request):
    """Get cart statistics (Admin only)"""
    if not request.user.is_admin:
        return Response({'error': 'Access denied'}, status=status.HTTP_403_FORBIDDEN)
    
    from django.db.models import Sum, Count
    from datetime import datetime, timedelta
    
    # Total carts
    total_carts = Cart.objects.count()
    
    # Active carts (updated in last 24 hours)
    active_carts = Cart.objects.filter(
        updated_at__gte=datetime.now() - timedelta(days=1)
    ).count()
    
    # Total items in all carts
    total_cart_items = CartItem.objects.count()
    
    # Total cart value
    total_cart_value = CartItem.objects.aggregate(
        total=Sum('total_price')
    )['total'] or 0
    
    # Most popular products in carts
    popular_products = CartItem.objects.values('product__name').annotate(
        total_quantity=Sum('quantity'),
        cart_count=Count('cart', distinct=True)
    ).order_by('-total_quantity')[:5]
    
    # Cart abandonment rate (carts with items but no orders)
    abandoned_carts = Cart.objects.filter(
        items__isnull=False
    ).exclude(
        session_key__in=Order.objects.values_list('session_key', flat=True)
    ).distinct().count()
    
    return Response({
        'total_carts': total_carts,
        'active_carts': active_carts,
        'total_cart_items': total_cart_items,
        'total_cart_value': float(total_cart_value),
        'popular_products': list(popular_products),
        'abandoned_carts': abandoned_carts
    })

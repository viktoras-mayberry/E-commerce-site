from django.shortcuts import render, get_object_or_404, redirect
from django.contrib import messages
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
from django.core.paginator import Paginator
from django.db.models import Q
from django.utils import timezone
from products.models import Product, Category
from orders.models import Order, OrderItem
from accounts.models import User
import json

def admin_required(view_func):
    """Decorator to check if user is admin"""
    def wrapper(request, *args, **kwargs):
        if not request.user.is_authenticated or not request.user.is_admin or request.user.email != 'admin@elegance.com':
            return redirect('/admin-login/')
        return view_func(request, *args, **kwargs)
    return wrapper

@admin_required
def products_management(request):
    """Product management page"""
    # Get filter parameters
    search = request.GET.get('search', '')
    category = request.GET.get('category', '')
    status = request.GET.get('status', '')
    sort = request.GET.get('sort', '-created_at')
    
    # Build query
    products = Product.objects.all()
    
    if search:
        products = products.filter(
            Q(name__icontains=search) |
            Q(description__icontains=search) |
            Q(sku__icontains=search)
        )
    
    if category:
        products = products.filter(category__id=category)
    
    if status == 'featured':
        products = products.filter(is_featured=True)
    elif status == 'bestseller':
        products = products.filter(is_bestseller=True)
    elif status == 'new_arrival':
        products = products.filter(is_new_arrival=True)
    elif status == 'low_stock':
        products = products.filter(stock_quantity__lte=10)
    
    # Sort products
    products = products.order_by(sort)
    
    # Pagination
    paginator = Paginator(products, 20)
    page_number = request.GET.get('page')
    page_obj = paginator.get_page(page_number)
    
    # Get categories for filter
    categories = Category.objects.all()
    
    context = {
        'products': page_obj,
        'categories': categories,
        'search': search,
        'selected_category': category,
        'selected_status': status,
        'sort': sort,
        'admin_user': request.user,
    }
    return render(request, 'admin/products.html', context)

@admin_required
def add_product(request):
    """Add new product page"""
    if request.method == 'POST':
        try:
            # Get form data
            name = request.POST.get('name')
            description = request.POST.get('description')
            price = request.POST.get('price')
            category_id = request.POST.get('category')
            sku = request.POST.get('sku')
            stock_quantity = request.POST.get('stock_quantity', 0)
            is_featured = request.POST.get('is_featured') == 'on'
            is_bestseller = request.POST.get('is_bestseller') == 'on'
            is_new_arrival = request.POST.get('is_new_arrival') == 'on'
            
            # Create product
            product = Product.objects.create(
                name=name,
                description=description,
                price=price,
                category_id=category_id,
                sku=sku,
                stock_quantity=stock_quantity,
                is_featured=is_featured,
                is_bestseller=is_bestseller,
                is_new_arrival=is_new_arrival,
            )
            
            # Handle image upload
            if 'image' in request.FILES:
                product.image = request.FILES['image']
                product.save()
            
            messages.success(request, f'Product "{product.name}" created successfully!')
            return redirect('admin_products')
            
        except Exception as e:
            messages.error(request, f'Error creating product: {str(e)}')
    
    categories = Category.objects.all()
    context = {
        'categories': categories,
        'admin_user': request.user,
    }
    return render(request, 'admin/add_product.html', context)

@admin_required
def edit_product(request, product_id):
    """Edit product page"""
    product = get_object_or_404(Product, id=product_id)
    
    if request.method == 'POST':
        try:
            # Update product fields
            product.name = request.POST.get('name')
            product.description = request.POST.get('description')
            product.price = request.POST.get('price')
            product.category_id = request.POST.get('category')
            product.sku = request.POST.get('sku')
            product.stock_quantity = request.POST.get('stock_quantity', 0)
            product.is_featured = request.POST.get('is_featured') == 'on'
            product.is_bestseller = request.POST.get('is_bestseller') == 'on'
            product.is_new_arrival = request.POST.get('is_new_arrival') == 'on'
            
            # Handle image upload
            if 'image' in request.FILES:
                product.image = request.FILES['image']
            
            product.save()
            
            messages.success(request, f'Product "{product.name}" updated successfully!')
            return redirect('admin_products')
            
        except Exception as e:
            messages.error(request, f'Error updating product: {str(e)}')
    
    categories = Category.objects.all()
    context = {
        'product': product,
        'categories': categories,
        'admin_user': request.user,
    }
    return render(request, 'admin/edit_product.html', context)

@admin_required
def delete_product(request, product_id):
    """Delete product"""
    if request.method == 'POST':
        product = get_object_or_404(Product, id=product_id)
        product_name = product.name
        product.delete()
        messages.success(request, f'Product "{product_name}" deleted successfully!')
        return redirect('admin_products')
    
    return redirect('admin_products')

@admin_required
def orders_management(request):
    """Orders management page"""
    # Get filter parameters
    search = request.GET.get('search', '')
    status = request.GET.get('status', '')
    payment_status = request.GET.get('payment_status', '')
    sort = request.GET.get('sort', '-created_at')
    
    # Build query
    orders = Order.objects.all()
    
    if search:
        orders = orders.filter(
            Q(order_number__icontains=search) |
            Q(customer_name__icontains=search) |
            Q(customer_email__icontains=search)
        )
    
    if status:
        orders = orders.filter(status=status)
    
    if payment_status:
        orders = orders.filter(payment_status=payment_status)
    
    # Sort orders
    orders = orders.order_by(sort)
    
    # Pagination
    paginator = Paginator(orders, 20)
    page_number = request.GET.get('page')
    page_obj = paginator.get_page(page_number)
    
    context = {
        'orders': page_obj,
        'search': search,
        'selected_status': status,
        'selected_payment_status': payment_status,
        'sort': sort,
        'admin_user': request.user,
    }
    return render(request, 'admin/orders.html', context)

@admin_required
def order_detail(request, order_id):
    """Order detail page"""
    order = get_object_or_404(Order, id=order_id)
    
    if request.method == 'POST':
        try:
            # Update order status
            new_status = request.POST.get('status')
            if new_status:
                order.status = new_status
                order.save()
                messages.success(request, f'Order status updated to {new_status}')
                return redirect('admin_order_detail', order_id=order_id)
            
        except Exception as e:
            messages.error(request, f'Error updating order: {str(e)}')
    
    context = {
        'order': order,
        'admin_user': request.user,
    }
    return render(request, 'admin/order_detail.html', context)


@admin_required
def inventory_management(request):
    """Inventory management page"""
    # Get filter parameters
    search = request.GET.get('search', '')
    stock_level = request.GET.get('stock_level', '')
    sort = request.GET.get('sort', 'name')
    
    # Build query
    products = Product.objects.all()
    
    if search:
        products = products.filter(
            Q(name__icontains=search) |
            Q(sku__icontains=search)
        )
    
    if stock_level == 'low':
        products = products.filter(stock_quantity__lte=10)
    elif stock_level == 'out':
        products = products.filter(stock_quantity=0)
    elif stock_level == 'in_stock':
        products = products.filter(stock_quantity__gt=10)
    
    # Sort products
    products = products.order_by(sort)
    
    # Pagination
    paginator = Paginator(products, 20)
    page_number = request.GET.get('page')
    page_obj = paginator.get_page(page_number)
    
    context = {
        'products': page_obj,
        'search': search,
        'selected_stock_level': stock_level,
        'sort': sort,
        'admin_user': request.user,
    }
    return render(request, 'admin/inventory.html', context)

@admin_required
def update_stock(request, product_id):
    """Update product stock"""
    if request.method == 'POST':
        try:
            product = get_object_or_404(Product, id=product_id)
            new_stock = request.POST.get('stock_quantity')
            product.stock_quantity = new_stock
            product.save()
            
            messages.success(request, f'Stock updated for {product.name}')
            return redirect('admin_inventory')
            
        except Exception as e:
            messages.error(request, f'Error updating stock: {str(e)}')
    
    return redirect('admin_inventory')

@admin_required
def analytics_dashboard(request):
    """Analytics dashboard"""
    from django.db.models import Sum, Count, Avg
    from datetime import timedelta
    
    # Get date range
    end_date = timezone.now()
    start_date = end_date - timedelta(days=30)
    
    # Sales analytics
    total_sales = Order.objects.filter(
        payment_status='paid',
        created_at__gte=start_date
    ).aggregate(total=Sum('total_amount'))['total'] or 0
    
    total_orders = Order.objects.filter(created_at__gte=start_date).count()
    avg_order_value = total_sales / total_orders if total_orders > 0 else 0
    
    # Top products
    top_products = Product.objects.annotate(
        total_sold=Sum('orderitem__quantity')
    ).order_by('-total_sold')[:10]
    
    # Sales by day
    sales_by_day = Order.objects.filter(
        payment_status='paid',
        created_at__gte=start_date
    ).extra(
        select={'day': 'date(created_at)'}
    ).values('day').annotate(
        total=Sum('total_amount'),
        count=Count('id')
    ).order_by('day')
    
    context = {
        'total_sales': total_sales,
        'total_orders': total_orders,
        'avg_order_value': avg_order_value,
        'top_products': top_products,
        'sales_by_day': sales_by_day,
        'admin_user': request.user,
    }
    return render(request, 'admin/analytics.html', context)

@admin_required
def settings_management(request):
    """Settings management page"""
    if request.method == 'POST':
        try:
            # Handle settings updates
            messages.success(request, 'Settings updated successfully!')
            return redirect('admin_settings')
            
        except Exception as e:
            messages.error(request, f'Error updating settings: {str(e)}')
    
    context = {
        'admin_user': request.user,
    }
    return render(request, 'admin/settings.html', context)

# API endpoints for AJAX requests
@csrf_exempt
@require_http_methods(["GET"])
def api_recent_orders(request):
    """API endpoint for recent orders"""
    if not request.user.is_authenticated or not request.user.is_admin:
        return JsonResponse({'error': 'Unauthorized'}, status=401)
    
    orders = Order.objects.order_by('-created_at')[:10]
    data = [{
        'id': order.id,
        'order_number': order.order_number,
        'customer_name': order.customer_name,
        'total_amount': float(order.total_amount),
        'status': order.status,
        'created_at': order.created_at.isoformat(),
    } for order in orders]
    
    return JsonResponse(data, safe=False)

@csrf_exempt
@require_http_methods(["GET"])
def api_top_products(request):
    """API endpoint for top selling products"""
    if not request.user.is_authenticated or not request.user.is_admin:
        return JsonResponse({'error': 'Unauthorized'}, status=401)
    
    products = Product.objects.annotate(
        total_sold=Sum('orderitem__quantity')
    ).order_by('-total_sold')[:5]
    
    data = [{
        'id': product.id,
        'name': product.name,
        'category': product.category.name,
        'total_sold': product.total_sold or 0,
    } for product in products]
    
    return JsonResponse(data, safe=False)

@csrf_exempt
@require_http_methods(["GET"])
def api_low_stock_products(request):
    """API endpoint for low stock products"""
    if not request.user.is_authenticated or not request.user.is_admin:
        return JsonResponse({'error': 'Unauthorized'}, status=401)
    
    products = Product.objects.filter(
        stock_quantity__lte=10
    ).order_by('stock_quantity')[:5]
    
    data = [{
        'id': product.id,
        'name': product.name,
        'sku': product.sku,
        'stock_quantity': product.stock_quantity,
    } for product in products]
    
    return JsonResponse(data, safe=False)

@csrf_exempt
@require_http_methods(["GET"])
def api_dashboard_analytics(request):
    """API endpoint for dashboard analytics"""
    if not request.user.is_authenticated or not request.user.is_admin:
        return JsonResponse({'error': 'Unauthorized'}, status=401)
    
    from django.db.models import Sum, Count
    from datetime import timedelta
    
    # Get analytics data
    total_products = Product.objects.count()
    total_orders = Order.objects.count()
    total_revenue = Order.objects.filter(
        payment_status='paid'
    ).aggregate(total=Sum('total_amount'))['total'] or 0
    
    # Recent orders (last 7 days)
    week_ago = timezone.now() - timedelta(days=7)
    recent_orders = Order.objects.filter(created_at__gte=week_ago).count()
    
    data = {
        'total_products': total_products,
        'total_orders': total_orders,
        'total_revenue': float(total_revenue),
        'recent_orders': recent_orders,
    }
    
    return JsonResponse(data)

@admin_required
def profile_management(request):
    """Profile management page"""
    context = {
        'admin_user': request.user,
    }
    return render(request, 'admin/profile.html', context)

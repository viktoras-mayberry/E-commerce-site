from django.shortcuts import render
from django.http import JsonResponse
from products.models import Product, Category
from orders.models import Cart, CartItem, Order

def home(request):
    """Serve the homepage with context data"""
    # Get featured products (controlled by admin)
    featured_products = Product.objects.filter(is_featured=True, is_active=True)[:8]
    
    # Get new arrivals (controlled by admin)
    new_arrivals = Product.objects.filter(is_new_arrival=True, is_active=True)[:8]
    
    # Get best sellers (controlled by admin)
    best_sellers = Product.objects.filter(is_bestseller=True, is_active=True)[:8]
    
    # Get categories
    categories = Category.objects.filter(is_active=True)[:10]
    
    context = {
        'featured_products': featured_products,
        'new_arrivals': new_arrivals,
        'best_sellers': best_sellers,
        'categories': categories,
    }
    return render(request, 'index.html', context)

def jewelry_page(request):
    """Serve the jewelry page with context data"""
    try:
        # Get jewelry products (controlled by admin)
        jewelry_products = Product.objects.filter(
            category__name__icontains='jewelry', 
            is_active=True
        ).order_by('-created_at')[:20]
        
        # Get categories
        categories = Category.objects.filter(is_active=True)
        
        context = {
            'products': jewelry_products,
            'categories': categories,
            'current_category': 'Jewelry',
        }
        
        print(f"Jewelry page - Products found: {jewelry_products.count()}")
        print(f"Jewelry page - Categories found: {categories.count()}")
        
        return render(request, 'jewelry-product.html', context)
    except Exception as e:
        print(f"Error in jewelry_page: {e}")
        # Return a simple response if there's an error
        from django.http import HttpResponse
        return HttpResponse(f"Error loading jewelry page: {e}")

def home_decor_page(request):
    """Serve the home decor page with context data"""
    # Get home decor products (controlled by admin)
    home_decor_products = Product.objects.filter(
        category__name__icontains='home', 
        is_active=True
    ).order_by('-created_at')[:20]
    
    # Get categories
    categories = Category.objects.filter(is_active=True)
    
    context = {
        'products': home_decor_products,
        'categories': categories,
        'current_category': 'Home Decor',
    }
    return render(request, 'home-product.html', context)

def dashboard_page(request):
    """Serve the dashboard page - Main admin only"""
    # Check if user is authenticated and is the main admin
    if not request.user.is_authenticated or not request.user.is_admin or request.user.email != 'admin@elegance.com':
        return render(request, 'admin_login.html')
    
    # Get comprehensive dashboard data
    from django.db.models import Sum, Count, Avg
    from django.utils import timezone
    from datetime import timedelta
    
    # Basic counts
    total_products = Product.objects.count()
    total_orders = Order.objects.count()
    
    # Revenue analytics
    total_revenue = Order.objects.filter(payment_status='paid').aggregate(
        total=Sum('total_amount')
    )['total'] or 0
    
    # Recent orders (last 7 days)
    week_ago = timezone.now() - timedelta(days=7)
    recent_orders = Order.objects.filter(created_at__gte=week_ago).count()
    
    # Top selling products
    from orders.models import OrderItem
    top_products = Product.objects.annotate(
        total_sold=Sum('orderitem__quantity')
    ).order_by('-total_sold')[:5]
    
    # Order status breakdown
    order_status_breakdown = Order.objects.values('status').annotate(
        count=Count('id')
    ).order_by('-count')
    
    # Recent orders for display
    recent_orders_list = Order.objects.select_related().order_by('-created_at')[:10]
    
    # Low stock products
    low_stock_products = Product.objects.filter(
        stock_quantity__lte=10
    ).order_by('stock_quantity')[:5]
    
    # Featured products count
    featured_products = Product.objects.filter(is_featured=True).count()
    bestsellers = Product.objects.filter(is_bestseller=True).count()
    new_arrivals = Product.objects.filter(is_new_arrival=True).count()
    
    context = {
        'total_products': total_products,
        'total_orders': total_orders,
        'total_revenue': total_revenue,
        'recent_orders': recent_orders,
        'top_products': top_products,
        'order_status_breakdown': order_status_breakdown,
        'recent_orders_list': recent_orders_list,
        'low_stock_products': low_stock_products,
        'featured_products': featured_products,
        'bestsellers': bestsellers,
        'new_arrivals': new_arrivals,
        'admin_user': request.user,
    }
    return render(request, 'admin_dashboard.html', context)

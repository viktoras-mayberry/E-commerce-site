"""
URL configuration for elegance_store project.
"""
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from django.views.generic import TemplateView
from django.shortcuts import render
from . import views
from . import admin_views

urlpatterns = [
    path('', views.home, name='home'),
    path('admin-login/', TemplateView.as_view(template_name='admin_login.html'), name='admin_login'),
    path('admin-login-simple/', TemplateView.as_view(template_name='admin_login_simple.html'), name='admin_login_simple'),
    path('jewelry/', views.jewelry_page, name='jewelry'),
    path('home-decor/', views.home_decor_page, name='home_decor'),
    path('dashboard/', views.dashboard_page, name='dashboard'),
    
    # Custom Admin Management Routes (must come before Django admin)
    path('admin/products/', admin_views.products_management, name='admin_products'),
    path('admin/products/add/', admin_views.add_product, name='admin_add_product'),
    path('admin/products/edit/<int:product_id>/', admin_views.edit_product, name='admin_edit_product'),
    path('admin/products/delete/<int:product_id>/', admin_views.delete_product, name='admin_delete_product'),
    
    path('admin/orders/', admin_views.orders_management, name='admin_orders'),
    path('admin/orders/<int:order_id>/', admin_views.order_detail, name='admin_order_detail'),
    
    path('admin/inventory/', admin_views.inventory_management, name='admin_inventory'),
    path('admin/inventory/update/<int:product_id>/', admin_views.update_stock, name='admin_update_stock'),
    path('admin/analytics/', admin_views.analytics_dashboard, name='admin_analytics'),
           path('admin/settings/', admin_views.settings_management, name='admin_settings'),
           path('admin/profile/', admin_views.profile_management, name='admin_profile'),
           
           # Django Admin (must come after custom admin routes)
           path('admin/', admin.site.urls),
    
    # API endpoints for AJAX
    path('api/orders/recent/', admin_views.api_recent_orders, name='api_recent_orders'),
    path('api/products/top-selling/', admin_views.api_top_products, name='api_top_products'),
    path('api/products/low-stock/', admin_views.api_low_stock_products, name='api_low_stock_products'),
    path('api/analytics/dashboard/', admin_views.api_dashboard_analytics, name='api_dashboard_analytics'),
    
    # API Routes
    path('api/auth/', include('accounts.urls')),
    path('api/products/', include('products.urls')),
    path('api/orders/', include('orders.urls')),
    path('api/payments/', include('payments.urls')),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)

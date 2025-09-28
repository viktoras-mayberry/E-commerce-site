from django.urls import path
from . import views

urlpatterns = [
    # Categories
    path('categories/', views.CategoryListView.as_view(), name='category-list'),
    
    # Products
    path('', views.ProductListView.as_view(), name='product-list'),
    path('<slug:slug>/', views.ProductDetailView.as_view(), name='product-detail'),
    path('create/', views.ProductCreateView.as_view(), name='product-create'),
    path('<slug:slug>/update/', views.ProductUpdateView.as_view(), name='product-update'),
    path('<slug:slug>/delete/', views.ProductDeleteView.as_view(), name='product-delete'),
    
    # Special product lists
    path('featured/', views.featured_products, name='featured-products'),
    path('bestsellers/', views.bestseller_products, name='bestseller-products'),
    path('new-arrivals/', views.new_arrival_products, name='new-arrival-products'),
    path('stats/', views.product_stats, name='product-stats'),
]

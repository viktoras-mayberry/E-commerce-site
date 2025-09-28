from django.urls import path
from . import views

urlpatterns = [
    # Categories
    path('categories/', views.CategoryListView.as_view(), name='category-list'),
    
    # Special product lists (must come before generic patterns)
    path('featured/', views.featured_products, name='featured-products'),
    path('bestsellers/', views.bestseller_products, name='bestseller-products'),
    path('new-arrivals/', views.new_arrival_products, name='new-arrival-products'),
    path('stats/', views.product_stats, name='product-stats'),
    path('search/', views.global_search, name='global-search'),
    
    # Products (generic patterns must come last)
    path('create/', views.ProductCreateView.as_view(), name='product-create'),
    path('<slug:slug>/update/', views.ProductUpdateView.as_view(), name='product-update'),
    path('<slug:slug>/delete/', views.ProductDeleteView.as_view(), name='product-delete'),
    path('<slug:slug>/', views.ProductDetailView.as_view(), name='product-detail'),
    path('', views.ProductListView.as_view(), name='product-list'),
]
